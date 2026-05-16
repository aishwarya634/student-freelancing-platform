from flask import Blueprint, request, jsonify
from config.db import get_db
from middleware.auth_middleware import auth_required
from flask_jwt_extended import get_jwt_identity
from bson import ObjectId
from datetime import datetime

teams_bp = Blueprint('teams', __name__)

@teams_bp.route('/', methods=['POST'])
@auth_required
def create_team():
    try:
        db = get_db()
        user_id = get_jwt_identity()
        data = request.get_json()
        team = {
            'name': data.get('name'),
            'project_id': ObjectId(data.get('project_id')),
            'members': [ObjectId(user_id)],
            'score': 0,
            'created_at': datetime.utcnow()
        }
        result = db.teams.insert_one(team)
        return jsonify({
            'message': 'Team created successfully',
            'team_id': str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@teams_bp.route('/my', methods=['GET'])
@auth_required
def get_my_team():
    try:
        db = get_db()
        user_id = get_jwt_identity()
        team = db.teams.find_one({'members': ObjectId(user_id)})
        if not team:
            return jsonify({'message': 'You are not in any team'}), 404
        team['_id'] = str(team['_id'])
        team['project_id'] = str(team['project_id'])
        team['members'] = [str(m) for m in team['members']]
        return jsonify(team), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500

@teams_bp.route('/join', methods=['POST'])
@auth_required
def join_team():
    try:
        db = get_db()
        user_id = get_jwt_identity()
        data = request.get_json()
        team_id = data.get('team_id')
        team = db.teams.find_one({'_id': ObjectId(team_id)})
        if not team:
            return jsonify({'message': 'Team not found'}), 404
        if ObjectId(user_id) in team['members']:
            return jsonify({'message': 'You are already in this team'}), 400
        db.teams.update_one(
            {'_id': ObjectId(team_id)},
            {'$push': {'members': ObjectId(user_id)}}
        )
        return jsonify({'message': 'Joined team successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Server error', 'error': str(e)}), 500