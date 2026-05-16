from flask import Blueprint, jsonify
from config.db import get_db
from middleware.auth_middleware import auth_required
from flask_jwt_extended import get_jwt_identity
from bson import ObjectId

portfolio_bp = Blueprint('portfolio', __name__)

@portfolio_bp.route('/my', methods=['GET'])
@auth_required
def get_my_portfolio():
    try:
        db = get_db()
        user_id = get_jwt_identity()
        user = db.users.find_one({'_id': ObjectId(user_id)})
        assessments = list(db.assessments.find({
            'student_id': ObjectId(user_id),
        }))
        projects = []
        for a in assessments:
            project = db.projects.find_one({'_id': a['project_id']})
            if project:
                projects.append({
                    'project_id': str(project['_id']),
                    'title': project.get('title'),
                    'category': project.get('category'),
                    'skills': project.get('skills', []),
                    'outcome_score': a.get('outcome_score'),
                    'teamwork_score': a.get('teamwork_score'),
                    'time_score': a.get('time_score'),
                    'total_score': a.get('total_score'),
                    'certificate_issued': a.get('certificate_issued'),
                    'completed_at': str(a.get('created_at'))
                })
        internships = list(db.applications.find({
            'student_id': ObjectId(user_id),
            'status': 'completed'
        }))
        internship_list = []
        for i in internships:
            internship = db.internships.find_one({'_id': i['internship_id']})
            if internship:
                internship_list.append({
                    'internship_id': str(internship['_id']),
                    'title': internship.get('title'),
                    'company_name': internship.get('company_name'),
                    'duration_months': internship.get('duration_months'),
                    'skills': internship.get('skills', [])
                })
        return jsonify({
            'name': user.get('name'),
            'score': user.get('score', 0),
            'certificates': len(user.get('certificates', [])),
            'projects': projects,
            'internships': internship_list
        }), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500