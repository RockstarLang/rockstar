import SimpleHTTPServer
import SocketServer

PORT = 1337

class Handler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    pass

Handler.extensions_map['.rock'] = 'text/plain'

httpd = SocketServer.TCPServer(("", PORT), Handler)

print ("serving at port", PORT)
httpd.serve_forever()