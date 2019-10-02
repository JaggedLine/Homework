from http.server import BaseHTTPRequestHandler,HTTPServer

PORT_NUMBER = 5000

class SecurityError(Exception):
    def __init__(self, message):
        self.message = message

def process(data: str) -> list:
    return [(0, 0)]

def clac(data: str) -> int:
    line = process(data)
    if len(set(line)) != len(line):
        raise SecurityError("STOP CHEATING! BAN!")
    if 

def save_results(result: tuple, field_size: int) -> None:
    f = open("table_" + str(field_size) + ".json", 'a')
    f.write(result[0] + ':' + str(result[1]) + ',')
    f.close()

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == "":
            self.path = "/index.html"
        try:
            sendReply = False
            if self.path.endswith(".html"):
                mimetype = "text/html"
                sendReply = True
            if self.path.endswith(".json"):
                mimetype = "text/plain"
                sendReply = True
            if self.path.endswith(".js"):
                mimetype = "application/javascript"
                sendReply = True
            if self.path.endswith(".png"):
                mimetype = "image/png"
                sendReply = True
            if self.path.endswith(".css"):
                mimetype = "text/css"
                sendReply = True
            if self.path.endswith(".ico"):
                mimetype = "image/icon"
                sendReply = True
            if self.path.endswith(".svg"):
                mimetype = "image/svg+xml"
                sendReply = True

            if sendReply:
                f = open("." + self.path, "rb")
                self.send_response(200)
                self.send_header("Content-type", mimetype)
                self.end_headers()
                self.wfile.write(f.read())
                f.close()
            return
        except IOError:
            self.send_error(404, "File Not Found: " + self.path)

    def do_POST(self):
        content_length = int(self.headers["Content-Length"])
        post_data = self.rfile.read(content_length).decode("utf8")
        print(post_data)
        try:
            result = calc(post_data)
        except SecurityError as e:
            self.send_error(403, e.message)
        save_results((self.headers["Name"], result), int(self.headers["Field-Size"]))
        self.send_response(200)
        self.send_header("Content-type", "")
        self.end_headers()

try:
    server = HTTPServer(("", PORT_NUMBER), Handler)
    server.serve_forever()
except KeyboardInterrupt:
    server.socket.close()
