import jwt
from datetime import datetime, timedelta


def generate_token(secret, user, algorithm='HS256', expires_days=7):
    payload = {
        'user_id': str(user.get('_id')),
        'email': user.get('email'),
        'exp': datetime.utcnow() + timedelta(days=expires_days)
    }
    token = jwt.encode(payload, secret, algorithm=algorithm)
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    return token


def decode_token(secret, token, algorithms=['HS256']):
    return jwt.decode(token, secret, algorithms=algorithms)
