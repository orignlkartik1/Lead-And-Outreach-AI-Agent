import json
import urllib.request
import urllib.error

base = "http://127.0.0.1:5000"
login_body = {"email": "testuser@example.com", "password": "Test1234!"}
req = urllib.request.Request(
    base + "/login",
    data=json.dumps(login_body).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='POST'
)
with urllib.request.urlopen(req) as res:
    data = json.loads(res.read().decode())
    token = data['token']
    print('login_status', res.status)
    print('token_preview', token[:20] + '...')

req = urllib.request.Request(
    base + "/me",
    headers={'Authorization': f'Bearer {token}'},
    method='GET'
)
with urllib.request.urlopen(req) as res:
    print('/me', res.status)
    print(res.read().decode())
