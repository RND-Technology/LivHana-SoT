#!/usr/bin/env python3
"""Execmon Agent - Minimal stub implementation."""
import argparse
import json
import logging
import signal
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(message)s')
logger = logging.getLogger(__name__)

class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "agent": "execmon"}).encode())
        else:
            self.send_error(404)
    def log_message(self, format, *args):
        pass

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=5017)
    args = parser.parse_args()
    
    server = ThreadingHTTPServer(('127.0.0.1', args.port), HealthHandler)
    
    def shutdown_handler(signum, frame):
        logger.info("execmon agent shutting down")
        server.shutdown()
        sys.exit(0)
    
    signal.signal(signal.SIGTERM, shutdown_handler)
    signal.signal(signal.SIGINT, shutdown_handler)
    
    logger.info(f"execmon agent started on port {args.port}")
    server.serve_forever()

if __name__ == '__main__':
    main()
