from flask import Blueprint, request, jsonify
from config.db import get_db
from flask_jwt_extended import create_access_token
import bcrypt
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        db = get_db()
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'student')
        skills = data.get('skills', [])

        if not name or not email or not password:
            return jsonify({'message': 'Name, email and password are required'}), 400

        existing = db.users.find_one({'email': email})
        if existing:
            return jsonify({'message': 'Email already registered'}), 400

        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        user = {
            'name': name,
            'email': email,
            'password': hashed,
            'role': role,
            'skills': skills,
            'score': 0,
            'certificates': [],
            'incomplete_badge': False,
            'cooldown_until': None
        }

        result = db.users.insert_one(user)
        token = create_access_token(
            identity=str(result.inserted_id),
            additional_claims={'role': role, 'name': name},
            expires_delta=timedelta(days=7)
        )

        return jsonify({
            'message': 'Registered successfully',
            'token': token,
            'user': {
                'id': str(result.inserted_id),
                'name': name,
                'email': email,
                'role': role,
                'skills': skills
            }
        }), 201

    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        db = get_db()
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400

        user = db.users.find_one({'email': email})
        if not user:
            return jsonify({'message': 'Invalid email or password'}), 401

        if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return jsonify({'message': 'Invalid email or password'}), 401

        token = create_access_token(
            identity=str(user['_id']),
            additional_claims={'role': user['role'], 'name': user['name']},
            expires_delta=timedelta(days=7)
        )

        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email'],
                'role': user['role'],
                'skills': user.get('skills', []),
                'score': user.get('score', 0)
            }
        }), 200

    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500