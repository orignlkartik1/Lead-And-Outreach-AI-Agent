import bcrypt
import traceback
from flask import request, jsonify, current_app
from models.userModel import get_user_by_email, create_user, sanitize_user_doc
from utils.token import generate_token


def signup():
    try:
        data = request.get_json() or {}
        name = (data.get('name') or '').strip()
        email = (data.get('email') or '').strip().lower()
        password = data.get('password') or ''

        if not name or not email or not password:
            return jsonify({'error': 'name, email and password are required'}), 400

        # existing user
        if get_user_by_email(email):
            return jsonify({'error': 'User already exists'}), 400

        # hash password and store as utf-8 string
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        hashed_str = hashed.decode('utf-8')

        user = create_user(name=name, email=email, password_hashed_str=hashed_str)

        token = generate_token(current_app.config['JWT_SECRET'], user)
        return jsonify({'user': sanitize_user_doc(user), 'token': token}), 201

    except Exception:
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500


def login():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        password = data.get('password') or ''

        if not email or not password:
            return jsonify({'error': 'email and password are required'}), 400

        user = get_user_by_email(email)
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401

        stored = user.get('password')
        if isinstance(stored, str):
            stored = stored.encode('utf-8')

        if not bcrypt.checkpw(password.encode('utf-8'), stored):
            return jsonify({'error': 'Invalid credentials'}), 401

        token = generate_token(current_app.config['JWT_SECRET'], user)
        return jsonify({'user': sanitize_user_doc(user), 'token': token}), 200

    except Exception:
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500
