from flask import Blueprint, request, jsonify
from config.db import get_db
from middleware.auth_middleware import auth_required, client_required
from flask_jwt_extended import get_jwt, get_jwt_identity
from bson import ObjectId
from datetime import datetime

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/', methods=['GET'])
@auth_required
def get_projects():
    try:
        db = get_db()
        category = request.args.get('category')
        query = {'status': 'open'}
        if category:
            query['category'] = category
        projects = list(db.projects.find(query))
        for p in projects:
            p['_id'] = str(p['_id'])
            if 'client_id' in p:
                p['client_id'] = str(p['client_id'])
        return jsonify(projects), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@projects_bp.route('/recommended', methods=['GET'])
@auth_required
def get_recommended():
    try:
        db = get_db()
        user_id = get_jwt_identity()
        user = db.users.find_one({'_id': ObjectId(user_id)})
        student_skills = [s.lower() for s in user.get('skills', [])]
        projects = list(db.projects.find({'status': 'open'}))
        result = []
        for p in projects:
            project_skills = [s.lower() for s in p.get('skills', [])]
            if not project_skills:
                continue
            matching = [s for s in student_skills if s in project_skills]
            percentage = round((len(matching) / len(project_skills)) * 100)
            if percentage > 0:
                p['_id'] = str(p['_id'])
                p['match_percentage'] = percentage
                result.append(p)
        result.sort(key=lambda x: x['match_percentage'], reverse=True)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@projects_bp.route('/', methods=['POST'])
@client_required
def create_project():
    try:
        db = get_db()
        user_id = get_jwt_identity()
        data = request.get_json()
        project = {
            'title': data.get('title'),
            'description': data.get('description'),
            'outcome': data.get('outcome'),
            'category': data.get('category'),
            'skills': data.get('skills', []),
            'stipend': data.get('stipend'),
            'type': data.get('type', 'solo'),
            'status': 'open',
            'client_id': ObjectId(user_id),
            'assigned_to': [],
            'deadline': data.get('deadline'),
            'milestones': data.get('milestones', []),
            'created_at': datetime.utcnow()
        }
        result = db.projects.insert_one(project)
        return jsonify({
            'message': 'Project created successfully',
            'project_id': str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@projects_bp.route('/<project_id>/apply', methods=['POST'])
@auth_required
def apply_project(project_id):
    try:
        db = get_db()
        user_id = get_jwt_identity()
        claims = get_jwt()
        if claims.get('role') != 'student':
            return jsonify({'message': 'Only students can apply'}), 403
        application = {
            'project_id': ObjectId(project_id),
            'student_id': ObjectId(user_id),
            'message': request.get_json().get('message', ''),
            'status': 'pending',
            'created_at': datetime.utcnow()
        }
        db.applications.insert_one(application)
        return jsonify({'message': 'Application submitted successfully'}), 201
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500