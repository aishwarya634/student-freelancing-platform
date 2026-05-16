from flask import Blueprint, jsonify, request
from config.db import get_db
from middleware.auth_middleware import admin_required
from flask_jwt_extended import get_jwt_identity
from bson import ObjectId
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_stats():
    try:
        db = get_db()
        total_users = db.users.count_documents({})
        total_projects = db.projects.count_documents({})
        active_projects = db.projects.count_documents({'status': 'in-progress'})
        total_assessments = db.assessments.count_documents({})
        return jsonify({
            'total_users': total_users,
            'total_projects': total_projects,
            'active_projects': active_projects,
            'total_assessments': total_assessments
        }), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    try:
        db = get_db()
        users = list(db.users.find({}, {'password': 0}))
        for u in users:
            u['_id'] = str(u['_id'])
        return jsonify(users), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@admin_bp.route('/users/<user_id>/ban', methods=['POST'])
@admin_required
def ban_user(user_id):
    try:
        db = get_db()
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'status': 'banned'}}
        )
        return jsonify({'message': 'User banned successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@admin_bp.route('/users/<user_id>/unban', methods=['POST'])
@admin_required
def unban_user(user_id):
    try:
        db = get_db()
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'status': 'active'}}
        )
        return jsonify({'message': 'User unbanned successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@admin_bp.route('/projects', methods=['GET'])
@admin_required
def get_all_projects():
    try:
        db = get_db()
        projects = list(db.projects.find({}))
        for p in projects:
            p['_id'] = str(p['_id'])
            p['client_id'] = str(p['client_id'])
        return jsonify(projects), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@admin_bp.route('/projects/<project_id>', methods=['DELETE'])
@admin_required
def delete_project(project_id):
    try:
        db = get_db()
        db.projects.delete_one({'_id': ObjectId(project_id)})
        return jsonify({'message': 'Project deleted successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@admin_bp.route('/companies/<company_id>/verify', methods=['POST'])
@admin_required
def verify_company(company_id):
    try:
        db = get_db()
        db.users.update_one(
            {'_id': ObjectId(company_id)},
            {'$set': {'verified': True}}
        )
        return jsonify({'message': 'Company verified successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@admin_bp.route('/disputes/<project_id>/refund', methods=['POST'])
@admin_required
def process_refund(project_id):
    try:
        db = get_db()
        db.projects.update_one(
            {'_id': ObjectId(project_id)},
            {'$set': {'status': 'refunded'}}
        )
        return jsonify({'message': 'Refund processed successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@admin_bp.route('/agreements/<agreement_id>/penalize', methods=['POST'])
@admin_required
def penalize_student(agreement_id):
    try:
        db = get_db()
        agreement = db.agreements.find_one({'_id': ObjectId(agreement_id)})
        if not agreement:
            return jsonify({'message': 'Agreement not found'}), 404
        cooldown_until = datetime.utcnow() + timedelta(days=7)
        db.users.update_one(
            {'_id': agreement['student_id']},
            {'$inc': {'score': -20},
             '$set': {
                'incomplete_badge': True,
                'cooldown_until': cooldown_until
             }}
        )
        db.agreements.update_one(
            {'_id': ObjectId(agreement_id)},
            {'$set': {'status': 'violated'}}
        )
        return jsonify({'message': 'Penalty applied successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500