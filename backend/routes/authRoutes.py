from flask import Blueprint, jsonify, g
from controllers.authController import signup, login
from middleware.authMiddleware import require_auth

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signup', methods=['POST'])
def route_signup():
    return signup()


@auth_bp.route('/login', methods=['POST'])
def route_login():
    return login()


@auth_bp.route('/me', methods=['GET'])
@require_auth
def route_me():
    # Protected route to return current user info from middleware
    return jsonify({'user': g.current_user}), 200
