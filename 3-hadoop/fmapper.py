#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
from collections import deque
import re

reload(sys)  
sys.setdefaultencoding('utf8')

for line in sys.stdin:
    d = deque()
    line = line.decode('utf-8').lower()
    for word in re.findall(ur'[a-zа-яё]+', line):
        d.append(word.lower())
        if len(d) > 3:
            d.popleft()
        if len(d) == 3:
            print '%s %s\t%s' % (d[0], d[1], d[2])
