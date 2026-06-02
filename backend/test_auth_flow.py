import json
import urllib.request
import urllib.error

base = "http://127.0.0.1:5000"

requests = [
    ("/signup", {"name": "Test User", "email": "testuser@example.com", "password": "Test1234!"}),
    ("/login", {"email": "testuser@example.com", "password": "Test1234!"})
]

for path, body in requests:
    req = urllib.request.Request(
        base + path,
        data=json.dumps(body).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req) as res:
            print(path, res.status)
            print(res.read().decode())
    except urllib.error.HTTPError as e:
        print(path, e.code)
        print(e.read().decode())
    except Exception as e:
        print(path, 'ERROR', e)
