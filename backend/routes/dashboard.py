from flask import Blueprint, jsonify
from config.db import get_db
from middleware.auth_middleware import auth_required
from flask_jwt_extended import get_jwt_identity, get_jwt
from bson import ObjectId

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/', methods=['GET'])
@auth_required
def get_dashboard():
    try:
        db = get_db()
        user_id = get_jwt_identity()
        claims = get_jwt()
        role = claims.get('role')

        user = db.users.find_one({'_id': ObjectId(user_id)}, {'password': 0})
        if not user:
            return jsonify({'message': 'User not found'}), 404

        user['_id'] = str(user['_id'])

        if role == 'student':
            active_projects = list(db.projects.find({
                'assigned_to': ObjectId(user_id),
                'status': {'$in': ['in-progress', 'review']}
            }))
            for p in active_projects:
                p['_id'] = str(p['_id'])
                p['client_id'] = str(p['client_id'])

            agreements = list(db.agreements.find({
                'student_id': ObjectId(user_id)
            }))

            total_earned = sum([a.get('stipend', 0) for a in agreements
                              if a.get('status') == 'completed'])

            return jsonify({
                'user': {
                    'name': user.get('name'),
                    'score': user.get('score', 0),
                    'totalEarned': total_earned,
                    'role': role
                },
                'stats': {
                    'projects': len(active_projects),
                    'internships': 0,
                    'agreements': len(agreements),
                    'escrow': 0
                },
                'activeProjects': active_projects
            }), 200

        elif role == 'client':
            my_projects = list(db.projects.find({
                'client_id': ObjectId(user_id)
            }))
            for p in my_projects:
                p['_id'] = str(p['_id'])
                p['client_id'] = str(p['client_id'])

            return jsonify({
                'user': {
                    'name': user.get('name'),
                    'role': role
                },
                'stats': {
                    'projects': len(my_projects),
                    'open': len([p for p in my_projects if p['status'] == 'open']),
                    'inProgress': len([p for p in my_projects if p['status'] == 'in-progress']),
                    'completed': len([p for p in my_projects if p['status'] == 'done'])
                },
                'myProjects': my_projects
            }), 200

        elif role == 'admin':
            total_users = db.users.count_documents({})
            total_projects = db.projects.count_documents({})
            active_projects = db.projects.count_documents({'status': 'in-progress'})
            disputes = db.agreements.count_documents({'status': 'violated'})

            return jsonify({
                'user': {
                    'name': user.get('name'),
                    'role': role
                },
                'stats': {
                    'totalUsers': total_users,
                    'totalProjects': total_projects,
                    'activeProjects': active_projects,
                    'disputes': disputes
                }
            }), 200

        else:
            return jsonify({
                'user': {
                    'name': user.get('name'),
                    'role': role
                },
                'stats': {}
            }), 200

    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500