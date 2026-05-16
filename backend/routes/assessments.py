from flask import Blueprint, request, jsonify
from config.db import get_db
from middleware.auth_middleware import auth_required
from flask_jwt_extended import get_jwt_identity, get_jwt
from bson import ObjectId
from datetime import datetime

assessments_bp = Blueprint('assessments', __name__)

@assessments_bp.route('/', methods=['POST'])
@auth_required
def create_assessment():
    try:
        db = get_db()
        user_id = get_jwt_identity()
        claims = get_jwt()
        if claims.get('role') != 'client':
            return jsonify({'message': 'Only clients can score students'}), 403
        data = request.get_json()
        outcome_score = data.get('outcome_score', 0)
        teamwork_score = data.get('teamwork_score', 0)
        time_score = data.get('time_score', 0)
        total_score = round((outcome_score + teamwork_score + time_score) / 3 * 10)
        assessment = {
            'project_id': ObjectId(data.get('project_id')),
            'student_id': ObjectId(data.get('student_id')),
            'client_id': ObjectId(user_id),
            'outcome_score': outcome_score,
            'teamwork_score': teamwork_score,
            'time_score': time_score,
            'total_score': total_score,
            'certificate_issued': True,
            'created_at': datetime.utcnow()
        }
        result = db.assessments.insert_one(assessment)
        db.users.update_one(
            {'_id': ObjectId(data.get('student_id'))},
            {'$set': {'score': total_score},
             '$push': {'certificates': {
                'project_id': data.get('project_id'),
                'score': total_score,
                'issued_at': datetime.utcnow()
             }}}
        )
        db.projects.update_one(
            {'_id': ObjectId(data.get('project_id'))},
            {'$set': {'status': 'done'}}
        )
        return jsonify({
            'message': 'Assessment submitted successfully',
            'assessment_id': str(result.inserted_id),
            'total_score': total_score,
            'certificate_issued': True
        }), 201
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@assessments_bp.route('/my', methods=['GET'])
@auth_required
def get_my_assessments():
    try:
        db = get_db()
        user_id = get_jwt_identity()
        assessments = list(db.assessments.find({'student_id': ObjectId(user_id)}))
        for a in assessments:
            a['_id'] = str(a['_id'])
            a['project_id'] = str(a['project_id'])
            a['student_id'] = str(a['student_id'])
            a['client_id'] = str(a['client_id'])
        return jsonify(assessments), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500