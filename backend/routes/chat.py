from flask import Blueprint, request, jsonify
from config.db import get_db
from middleware.auth_middleware import auth_required
from flask_jwt_extended import get_jwt_identity
from bson import ObjectId
from datetime import datetime

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/<user_id>', methods=['GET'])
@auth_required
def get_messages(user_id):
    try:
        db = get_db()
        current_user = get_jwt_identity()
        messages = list(db.messages.find({
            '$or': [
                {'sender_id': ObjectId(current_user), 'receiver_id': ObjectId(user_id)},
                {'sender_id': ObjectId(user_id), 'receiver_id': ObjectId(current_user)}
            ]
        }).sort('created_at', 1))
        for m in messages:
            m['_id'] = str(m['_id'])
            m['sender_id'] = str(m['sender_id'])
            m['receiver_id'] = str(m['receiver_id'])
        return jsonify(messages), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@chat_bp.route('/send', methods=['POST'])
@auth_required
def send_message():
    try:
        db = get_db()
        current_user = get_jwt_identity()
        data = request.get_json()
        message = {
            'sender_id': ObjectId(current_user),
            'receiver_id': ObjectId(data.get('receiver_id')),
            'message': data.get('message'),
            'created_at': datetime.utcnow()
        }
        result = db.messages.insert_one(message)
        return jsonify({
            'message': 'Message sent successfully',
            'message_id': str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500