#!/usr/bin/env python
import zmq
import random
import sys
import time
import os
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import SocketServer
import threading
from mimetypes import types_map


class FileServer(BaseHTTPRequestHandler):

    def do_GET(self):
        fname, ext = os.path.splitext(self.path)
        context = zmq.Context()
        socket = context.socket(zmq.PAIR)
        socket.bind("tcp://*:5556")
        socket.send(self.path.strip('/'))
        file = socket.recv_pyobj()
        socket.close()
        self.send_response(file["status"])
        self.send_header('Content-type', types_map.get(ext, "application/octet-stream"))
        self.end_headers()
        self.wfile.write(file["content"])

def run_http():
    server_address = ('', 80)
    httpd = HTTPServer(server_address, FileServer)
    print ' [*] Starting httpd...'
    httpd.serve_forever()

run_http()
