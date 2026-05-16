from flask import Blueprint, request, jsonify
from config.db import get_db
from middleware.auth_middleware import auth_required
from flask_jwt_extended import get_jwt_identity
from bson import ObjectId
from datetime import datetime

agreements_bp = Blueprint('agreements', __name__)

@agreements_bp.route('/', methods=['POST'])
@auth_required
def create_agreement():
    try:
        db = get_db()
        user_id = get_jwt_identity()
        data = request.get_json()
        agreement = {
            'project_id': ObjectId(data.get('project_id')),
            'student_id': ObjectId(data.get('student_id')),
            'client_id': ObjectId(user_id),
            'terms': data.get('terms'),
            'penalty_clause': {
                'score_deduction': 20,
                'incomplete_badge_days': 30,
                'cooldown_days': 7,
                'auto_refund': True
            },
            'stipend': data.get('stipend'),
            'deadline': data.get('deadline'),
            'milestones': data.get('milestones', []),
            'student_agreed': False,
            'client_agreed': True,
            'status': 'pending',
            'created_at': datetime.utcnow()
        }
        result = db.agreements.insert_one(agreement)
        return jsonify({
            'message': 'Agreement created successfully',
            'agreement_id': str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@agreements_bp.route('/<agreement_id>/accept', methods=['POST'])
@auth_required
def accept_agreement(agreement_id):
    try:
        db = get_db()
        user_id = get_jwt_identity()
        agreement = db.agreements.find_one({'_id': ObjectId(agreement_id)})
        if not agreement:
            return jsonify({'message': 'Agreement not found'}), 404
        if str(agreement['student_id']) != user_id:
            return jsonify({'message': 'Only the assigned student can accept'}), 403
        db.agreements.update_one(
            {'_id': ObjectId(agreement_id)},
            {'$set': {
                'student_agreed': True,
                'status': 'active',
                'accepted_at': datetime.utcnow()
            }}
        )
        db.projects.update_one(
            {'_id': agreement['project_id']},
            {'$set': {'status': 'in-progress'}}
        )
        return jsonify({'message': 'Agreement accepted successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@agreements_bp.route('/my', methods=['GET'])
@auth_required
def get_my_agreements():
    try:
        db = get_db()
        user_id = get_jwt_identity()
        agreements = list(db.agreements.find({
            '$or': [
                {'student_id': ObjectId(user_id)},
                {'client_id': ObjectId(user_id)}
            ]
        }))
        for a in agreements:
            a['_id'] = str(a['_id'])
            a['project_id'] = str(a['project_id'])
            a['student_id'] = str(a['student_id'])
            a['client_id'] = str(a['client_id'])
        return jsonify(agreements), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500