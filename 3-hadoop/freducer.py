#!/usr/bin/env python

from operator import itemgetter
import sys
import json

reload(sys)  
sys.setdefaultencoding('utf8')

class NextWordFreqReducer:
    def __init__(self, context, following_count):
        self.context = context
        self.following_count = following_count

    @staticmethod
    def from_kv(key, val):
        d = {}
        d[val] = 1
        return NextWordFreqReducer(key, d)

    def process_val(self, word):
        curr = self.following_count.get(word) or 0
        self.following_count[word] = curr + 1

    def kvs(self):
        context_count = sum(self.following_count.itervalues())
        for word, count in self.following_count.iteritems():
            yield (self.context + " " + word, '(pairs: %s, triplets: %s, odds:%.2f)' % (context_count, count, count * 1.0 / context_count))

curr_key = None
curr_reducer = None
pair = None


def print_kvs(kvs):
    for kv in kvs:
        print '%s\t%s' % kv


for line in sys.stdin:
    line = line.strip()
    try:
	    key, val = line.split('\t', 1)
    except:
		raise Exception("Wrong line '%s'" % (line))
    if curr_key != key:
        if curr_reducer:
            print_kvs(curr_reducer.kvs())
        curr_key = key
        curr_reducer = NextWordFreqReducer.from_kv(key, val)
    else:
        curr_reducer.process_val(val)


if curr_reducer:
    print_kvs(curr_reducer.kvs())