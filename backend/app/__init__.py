"""
This file sets up: Database initialization, Login manager & Bcrypt for password hashing.
"""

import os
from dotenv import load_dotenv, find_dotenv

from flask import Flask

from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

# from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:3000"}},
    supports_credentials=True,
)
# app.config["SESSION_COOKIE_SAMESITE"] = "None"
# app.config["SESSION_COOKIE_SECURE"] = False  # True if HTTPS
# app.config["SESSION_COOKIE_DOMAIN"] = "localhost"


jwt = JWTManager(app)


@jwt.invalid_token_loader
def invalid_token_callback(reason):
    print("DEBUG invalid_token_loader:", reason)
    return jsonify({"error": "Invalid token", "reason": reason}), 422


@jwt.unauthorized_loader
def unauthorized_callback(reason):
    print("DEBUG unauthorized_loader:", reason)
    return jsonify({"error": "Unauthorized", "reason": reason}), 401


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print("DEBUG expired_token_loader: token expired")
    return jsonify({"error": "Token expired"}), 401


@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    print("DEBUG revoked_token_loader: token revoked")
    return jsonify({"error": "Token revoked"}), 401


db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# login_manager = LoginManager()
# login_manager.init_app(app)
# login_manager.login_view = "login"
# login_manager.session_protection = "strong"


# @login_manager.user_loader
# def load_user(user_id):
#     from .models import User

#     return db.session.get(User, int(user_id))


from .routes import *
