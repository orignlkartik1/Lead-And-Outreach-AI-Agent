from functools import wraps
from flask import request, jsonify, current_app, g
from utils.token import decode_token
from models.userModel import get_user_by_id, sanitize_user_doc


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authorization header missing'}), 401

        token = auth_header.split(' ', 1)[1].strip()
        try:
            payload = decode_token(current_app.config['JWT_SECRET'], token)
        except Exception:
            return jsonify({'error': 'Invalid or expired token'}), 401

        user_id = payload.get('user_id')
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 401

        g.current_user = sanitize_user_doc(user)
        return f(*args, **kwargs)

    return decorated
