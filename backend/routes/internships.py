from flask import Blueprint, request, jsonify
from config.db import get_db
from middleware.auth_middleware import auth_required
from flask_jwt_extended import get_jwt, get_jwt_identity
from bson import ObjectId
from datetime import datetime

internships_bp = Blueprint('internships', __name__)

@internships_bp.route('/', methods=['GET'])
@auth_required
def get_internships():
    try:
        db = get_db()
        internships = list(db.internships.find({'status': 'open'}))
        for i in internships:
            i['_id'] = str(i['_id'])
            if 'company_id' in i:
                i['company_id'] = str(i['company_id'])
        return jsonify(internships), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@internships_bp.route('/', methods=['POST'])
@auth_required
def post_internship():
    try:
        db = get_db()
        user_id = get_jwt_identity()
        claims = get_jwt()
        if claims.get('role') != 'company':
            return jsonify({'message': 'Only verified companies can post internships'}), 403
        data = request.get_json()
        internship = {
            'title': data.get('title'),
            'company_name': data.get('company_name'),
            'description': data.get('description'),
            'outcome': data.get('outcome'),
            'category': data.get('category'),
            'skills': data.get('skills', []),
            'stipend_per_month': data.get('stipend_per_month'),
            'duration_months': data.get('duration_months'),
            'type': data.get('type', 'remote'),
            'status': 'open',
            'company_id': ObjectId(user_id),
            'applicants': [],
            'deadline': data.get('deadline'),
            'created_at': datetime.utcnow()
        }
        result = db.internships.insert_one(internship)
        return jsonify({
            'message': 'Internship posted successfully',
            'internship_id': str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@internships_bp.route('/<internship_id>/apply', methods=['POST'])
@auth_required
def apply_internship(internship_id):
    try:
        db = get_db()
        user_id = get_jwt_identity()
        claims = get_jwt()
        if claims.get('role') != 'student':
            return jsonify({'message': 'Only students can apply'}), 403
        application = {
            'internship_id': ObjectId(internship_id),
            'student_id': ObjectId(user_id),
            'message': request.get_json().get('message', ''),
            'status': 'pending',
            'created_at': datetime.utcnow()
        }
        db.applications.insert_one(application)
        return jsonify({'message': 'Application submitted successfully'}), 201
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500