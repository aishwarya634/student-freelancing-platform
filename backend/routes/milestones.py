from flask import Blueprint, request, jsonify
from config.db import get_db
from middleware.auth_middleware import auth_required
from flask_jwt_extended import get_jwt_identity, get_jwt
from bson import ObjectId
from datetime import datetime, timedelta

milestones_bp = Blueprint('milestones', __name__)

@milestones_bp.route('/<milestone_id>/submit', methods=['POST'])
@auth_required
def submit_milestone(milestone_id):
    try:
        db = get_db()
        user_id = get_jwt_identity()
        data = request.get_json()
        db.milestones.update_one(
            {'_id': ObjectId(milestone_id)},
            {'$set': {
                'status': 'submitted',
                'github_link': data.get('github_link'),
                'video_link': data.get('video_link'),
                'student_notes': data.get('student_notes'),
                'submitted_files': data.get('files', []),
                'submitted_at': datetime.utcnow()
            }}
        )
        return jsonify({'message': 'Milestone submitted successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@milestones_bp.route('/<milestone_id>/approve', methods=['POST'])
@auth_required
def approve_milestone(milestone_id):
    try:
        db = get_db()
        claims = get_jwt()
        if claims.get('role') != 'client':
            return jsonify({'message': 'Only clients can approve'}), 403
        milestone = db.milestones.find_one({'_id': ObjectId(milestone_id)})
        if not milestone:
            return jsonify({'message': 'Milestone not found'}), 404
        db.milestones.update_one(
            {'_id': ObjectId(milestone_id)},
            {'$set': {
                'status': 'approved',
                'approved_at': datetime.utcnow()
            }}
        )
        db.users.update_one(
            {'_id': milestone['student_id']},
            {'$inc': {'earned': milestone.get('stipend', 0)}}
        )
        return jsonify({'message': 'Milestone approved and payment released'}), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@milestones_bp.route('/<milestone_id>/request-changes', methods=['POST'])
@auth_required
def request_changes(milestone_id):
    try:
        db = get_db()
        claims = get_jwt()
        if claims.get('role') != 'client':
            return jsonify({'message': 'Only clients can request changes'}), 403
        data = request.get_json()
        db.milestones.update_one(
            {'_id': ObjectId(milestone_id)},
            {'$set': {
                'status': 'changes-requested',
                'client_feedback': data.get('feedback'),
                'changes_requested_at': datetime.utcnow()
            }}
        )
        return jsonify({'message': 'Changes requested successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@milestones_bp.route('/project/<project_id>', methods=['GET'])
@auth_required
def get_project_milestones(project_id):
    try:
        db = get_db()
        milestones = list(db.milestones.find({'project_id': ObjectId(project_id)}))
        for m in milestones:
            m['_id'] = str(m['_id'])
            m['project_id'] = str(m['project_id'])
            if 'student_id' in m:
                m['student_id'] = str(m['student_id'])
        return jsonify(milestones), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@milestones_bp.route('/penalize/<student_id>', methods=['POST'])
@auth_required
def penalize_student(student_id):
    try:
        db = get_db()
        claims = get_jwt()
        if claims.get('role') not in ['admin', 'client']:
            return jsonify({'message': 'Not authorized'}), 403
        cooldown_until = datetime.utcnow() + timedelta(days=7)
        db.users.update_one(
            {'_id': ObjectId(student_id)},
            {'$inc': {'score': -20},
             '$set': {
                'incomplete_badge': True,
                'cooldown_until': cooldown_until
             }}
        )
        return jsonify({'message': 'Penalty applied successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500
    