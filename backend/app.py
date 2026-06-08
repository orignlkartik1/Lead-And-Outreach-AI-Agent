import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from config.db import init_db

# Import blueprints
from routes.authRoutes import auth_bp
from routes.leadRoutes import lead_bp
from routes.icpRoutes import icp_bp
from routes.asyncRoutes import async_bp
from routes.emailRoutes import email_bp


def get_cors_origins():
    origins = os.getenv(
        'CORS_ORIGINS',
        'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000',
    )
    return [origin.strip() for origin in origins.split(',') if origin.strip()]


def create_app():
    """Application factory for the backend service."""
    load_dotenv()
    app = Flask(__name__)

    # Load config from environment or defaults
    app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/ai_leads')
    app.config['JWT_SECRET'] = os.getenv('JWT_SECRET', 'change-this-secret')
    app.config['JWT_ALGORITHM'] = os.getenv('JWT_ALGORITHM', 'HS256')

    # Enable CORS for local frontend integration (adjust origins in production)
    CORS(
        app,
        resources={r"/*": {"origins": get_cors_origins()}},
        supports_credentials=True,
        allow_headers=['Content-Type', 'Authorization'],
        methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    )

    # Initialize DB and other resources
    init_db(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(lead_bp)
    app.register_blueprint(icp_bp)
    app.register_blueprint(async_bp)
    app.register_blueprint(email_bp)

    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok'}), 200

    return app


if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', '1') == '1'
    app.run(host='0.0.0.0', port=port, debug=debug)
