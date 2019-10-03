from http.server import BaseHTTPRequestHandler,HTTPServer
import json

PORT_NUMBER = 5000

class SecurityError(Exception):
    def __init__(self, message):
        self.message = message

def process(data: str) -> tuple:
    line_bad = json.loads(data)
    line = [(i[0], i[1]) for i in line_bad]
    x = [i[0] for i in line_bad]
    y = [i[1] for i in line_bad]
    return (line, x, y)

def vec_mul(a: tuple, b: tuple) -> tuple:
    return a[0] * b[1] - a[1] * b[0]

def intersect(segment1: tuple, segment2: tuple) -> bool:
    x1, y1, x2, y2, x3, y3, x4, y4 = segment1[0][0], segment1[0][1], segment1[1][0], segment1[1][1], segment2[0][0], segment2[0][1], segment2[1][0], segment2[1][1]
    a = vec_mul((x2 - x1, y2 - y1), (x3 - x1, y3 - y1)) * vec_mul((x2 - x1, y2 - y1), (x4 - x1, y4 - y1))
    b = vec_mul((x4 - x3, y4 - y3), (x1 - x3, y1 - y3)) * vec_mul((x4 - x3, y4 - y3), (x2 - x3, y2 - y3))
    return (a <= 0 and b <= 0)

def calc(data: str, field_size: tuple) -> int:
    line, x, y = process(data)
    if (len(set(line)) != len(line)):
        raise SecurityError("STOP CHEATING! BAN!")
    if (max(y) >= field_size[1] or min(y) < 0 or max(x) >= field_size[0] or min(x) < 0):
        raise SecurityError("STOP CHEATING! BAN!")
    for i in range(1, len(line)):
        for j in range(i+2, len(line)):
            if (intersect((line[i-1], line[i]), (line[j-1], line[j]))):
                raise SecurityError("STOP CHEATING! BAN!")
    return len(line) - 1

def save_results(result: tuple, field_size: tuple) -> None:
    f = open("table_" + str(field_size[0]) + '_' + str(field_size[1]) + ".json", 'a')
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
        print(self.headers)
        FORBID = ",;:.{}[]()\n\t"
        for i in FORBID:
            if (i in self.headers["Name"]):
                #self.send_error(403, "Bad username. '" + FORBID + "' not allowed in username.")
                self.send_response(200)
                self.send_header("Content-type", "")
                self.end_headers()
                return
        field_size = (int(self.headers["Field-Size-X"]), int(self.headers["Field-Size-Y"]))
        try:
            result = calc(post_data, field_size)
        except SecurityError as e:
            self.send_error(403, e.message)
            return
        save_results((self.headers["Name"], result), field_size)
        self.send_response(200)
        self.send_header("Content-type", "")
        self.end_headers()

try:
    server = HTTPServer(("", PORT_NUMBER), Handler)
    server.serve_forever()
except KeyboardInterrupt:
    server.socket.close()
