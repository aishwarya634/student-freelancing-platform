from flask_jwt_extended import verify_jwt_in_request, get_jwt
from functools import wraps
from flask import jsonify

def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'message': 'Invalid or missing token'}), 401
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get('role') != 'admin':
                return jsonify({'message': 'Admin access only'}), 403
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'message': 'Invalid or missing token'}), 401
    return decorated

def client_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get('role') != 'client':
                return jsonify({'message': 'Client access only'}), 403
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'message': 'Invalid or missing token'}), 401
    return decorated