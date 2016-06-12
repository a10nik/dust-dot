#!/usr/bin/env python
import pika
import sys
import pickle
import time
import os
import psutil
import random

id_string = sys.argv[1] if len(sys.argv) > 1 else os.getpid()
routing_key = 'stats.%s' % (id_string);

connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbit'))
channel = connection.channel()
channel.exchange_declare(exchange='resources_stats', type='topic')


try:
    state = []
    proc = psutil.Process()
    while True:
        time.sleep(2)
        if random.random() > 0.5:
            state.append([x ** 13 for x in range(0, int(random.random() * 1800000))])
        if random.random() > 0.9:
            del state[:]
        current_time = time.time();
        message = dict(cpu=proc.cpu_percent(), ram=proc.memory_percent(), time=current_time)
        channel.basic_publish(exchange='resources_stats',
                          routing_key=routing_key,
                          body=pickle.dumps(message))
        print(" [%r] Sent: %r" % (routing_key, message))
finally:
    connection.close()