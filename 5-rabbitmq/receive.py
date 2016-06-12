#!/usr/bin/env python
import pika
import sys
import pickle
import os
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import SocketServer
import threading
from mimetypes import types_map
import json

avg_data = []
received_stats = {
    'legend': [],
    'data': []
}

def avg(l):
    return float(sum(l))/len(l) if len(l) > 0 else float('nan')

def listen_to_rabbit(binding_key, callback):
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbit'))
    channel = connection.channel()
    channel.exchange_declare(exchange='resources_stats', type='topic')
    result = channel.queue_declare(exclusive=True)
    queue_name = result.method.queue
    channel.queue_bind(exchange='resources_stats',
                       queue=queue_name,
                       routing_key=binding_key)
    channel.basic_consume(callback,
                      queue=queue_name,
                      no_ack=True)
    channel.start_consuming()

def listen_to_rabbit_and_store_in_received_stats(binding_key, sender_index):
    def callback(ch, method, properties, body):
        message = pickle.loads(body)
        received_stats["data"][sender_index].append(message)
        print(" [x] Got %r from %r" % (message, method.routing_key))

    listen_to_rabbit(binding_key, callback)


def listen_to_rabbit_and_store_averages():
    def callback(ch, method, properties, body):
        message = pickle.loads(body)
        avg_data.append(message)
        senders_count = len(received_stats['legend']) - 1
        if len(avg_data) >= senders_count:
            avg_cpu = avg([m['cpu'] for m in avg_data])
            avg_ram = avg([m['ram'] for m in avg_data])
            avg_time = avg([m['time'] for m in avg_data])
            del avg_data[:]
            received_stats['data'][senders_count].append({
                'cpu': avg_cpu,
                'ram': avg_ram,
                'time': avg_time
            })
        print(" [x] Averaging %r from %r" % (message, method.routing_key))

    listen_to_rabbit("stats.*", callback)


ids = sys.argv[1:]
for index, sender_id in enumerate(ids):
    binding_key = 'stats.%s' % (sender_id)
    received_stats['legend'].append(sender_id)
    received_stats['data'].append([])
    threading.Thread(target=listen_to_rabbit_and_store_in_received_stats, args=[binding_key, index]).start()

received_stats['legend'].append("avg")
received_stats['data'].append([])
threading.Thread(target=listen_to_rabbit_and_store_averages).start()


#==================================================================
class StatsApi(BaseHTTPRequestHandler):

    def do_GET(self):
        if self.path == "/stats":
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(received_stats))
            return
        try:
            if self.path == "/":
                self.path = "/index.html"
            if self.path == "favico.ico":
                return
            fname, ext = os.path.splitext(self.path)

            if ext in (".html", ".css", ".js", ".png"):
                with open(os.path.join("./static", self.path.strip('/'))) as f:
                    self.send_response(200)
                    self.send_header('Content-type', types_map[ext])
                    self.end_headers()
                    self.wfile.write(f.read())
            return
        except IOError:
            self.send_error(404)

def run_http():
    server_address = ('', 80)
    httpd = HTTPServer(server_address, StatsApi)
    print ' [*] Starting httpd...'
    httpd.serve_forever()

run_http()  