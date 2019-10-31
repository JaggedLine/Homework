from http.server import BaseHTTPRequestHandler,HTTPServer
from operator import itemgetter
import json, os, time

PORT_NUMBER = 8004
FIELDS_INFO = {
    (6, 6): ((3, 3), (4, 5)),
    (7, 7): ((3, 3), (4, 6)),
    (8, 8): ((3, 3), (4, 6)),
    (10, 10): ((3, 3), (4, 6)),
}
# max count of saved result
DB_SIZE = 100

class SecurityError(Exception):
    def __init__(self, message):
        self.message = message

def process(data: str) -> tuple:
    ddict = json.loads(data)
    line_bad = ddict["points"]
    name = ddict["name"]
    if name == "" or len(name) > 100 or line_bad is None:
        return ("", None)
    line = [(i[0], i[1]) for i in line_bad]
    x = [i[0] for i in line_bad]
    y = [i[1] for i in line_bad]
    return (name, (line, x, y))

def cross_product(a: tuple, b: tuple) -> tuple:
    return a[0] * b[1] - a[1] * b[0]

def intersect(segment1: tuple, segment2: tuple) -> bool:
    x1, y1, x2, y2, x3, y3, x4, y4 = segment1[0][0], segment1[0][1], segment1[1][0], segment1[1][1], segment2[0][0], segment2[0][1], segment2[1][0], segment2[1][1]
    a = cross_product((x2 - x1, y2 - y1), (x3 - x1, y3 - y1)) * cross_product((x2 - x1, y2 - y1), (x4 - x1, y4 - y1))
    b = cross_product((x4 - x3, y4 - y3), (x1 - x3, y1 - y3)) * cross_product((x4 - x3, y4 - y3), (x2 - x3, y2 - y3))
    if a <= 0 and b <= 0:
        if a == 0 and b == 0:
            return False
        return True
    return False

def verify_and_calc(data: tuple, field_size: tuple, ends: tuple) -> int:
    line, x, y = data
    knight_dir = [(1, 2), (2, 1), (-1, 2), (2, -1), (-2, 1), (1, -2), (-1, -2), (-2, -1)]
    if len(line) == 0:
        raise SecurityError("STOP CHEATING! BAN! (Chain must be not empty)")
    if (len(set(line)) != len(line)):
        raise SecurityError("STOP CHEATING! BAN! (Points must be unique)")
    if (max(y) >= field_size[1] or min(y) < 0 or max(x) >= field_size[0] or min(x) < 0):
        raise SecurityError("STOP CHEATING! BAN! (Your chain is out of bounds!)")
    if (tuple(field_size) not in FIELDS_INFO):
        raise SecurityError("STOP CHEATING! BAN! (Incorrect field size)")
    if ((x[0], y[0]) != ends[0] or (x[-1], y[-1]) != ends[1]):
        raise SecurityError("STOP CHEATING! BAN! (Your chain has incorrect ends!)")
    for i in range(1, len(line)):
        if ((line[i][0]-line[i-1][0], line[i][1]-line[i-1][1]) not in knight_dir):
            raise SecurityError("STOP CHEATING! BAN! (Segments must be like a knight move)")
    for i in range(1, len(line)):
        for j in range(i+2, len(line)):
            if (intersect((line[i-1], line[i]), (line[j-1], line[j]))):
                raise SecurityError("STOP CHEATING! BAN! (Segments must not intersect)")
    return len(line) - 1

def save_results(result: tuple, field_size: tuple) -> None:
    if not os.path.isdir("Results"):
        os.mkdir("Results")
    fname = os.path.join("Results", "table_" + str(field_size[0]) + '_' + str(field_size[1]) + ".json")
    if not os.path.isfile(fname):
        f = open(fname, 'w', encoding="utf-8")
        f.write("{}")
        f.close()

    f = open(fname, encoding="utf-8")
    a = json.load(f)
    f.close()
    
    if (not result[0] in a.keys()):
        a[result[0]] = result[1]
    a[result[0]] = max(a[result[0]], result[1])

    a = dict(sorted(a.items(), reverse=True, key=itemgetter(1, 0))[:DB_SIZE])

    f = open(fname, 'w', encoding="utf-8")
    json.dump(a, f, indent=4, ensure_ascii=False)
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
        name, data = process(self.rfile.read(content_length).decode("utf8"))
        if (data is None or name == ""):
            return
        field_size = (int(self.headers["Field-Size-X"]), int(self.headers["Field-Size-Y"]))
        try:
            result = verify_and_calc(data, field_size, FIELDS_INFO.get(field_size))
        except SecurityError as e:
            self.send_error(403, e.message)
            return
        print(name, field_size, "Score =", result, data[0])
        save_results((name, result), field_size)
        self.send_response(200)
        self.send_header("Content-type", "")
        self.end_headers()

try:
    server = HTTPServer(("", PORT_NUMBER), Handler)
    server.serve_forever()
except KeyboardInterrupt:
    server.socket.close()
