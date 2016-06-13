#!/usr/bin/env python
import zmq
import random
import sys
import time
import os

context = zmq.Context()
socket = context.socket(zmq.PAIR)
socket.connect("tcp://localhost:5556")

while True:
    path = socket.recv()
    try:
        with open(os.path.join(".", path)) as f:
            file = { 'content': f.read(), 'status': 200 }
    except IOError:
        file = { 'content': None, 'status': 404 }
    socket.send_pyobj(file)
