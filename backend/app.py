from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__,
    static_folder='../frontend',
    static_url_path='')

CORS(app)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET')
jwt = JWTManager(app)

from routes.auth import auth_bp
from routes.projects import projects_bp
from routes.internships import internships_bp
from routes.teams import teams_bp
from routes.agreements import agreements_bp
from routes.milestones import milestones_bp
from routes.assessments import assessments_bp
from routes.chat import chat_bp
from routes.portfolio import portfolio_bp
from routes.admin import admin_bp
from routes.dashboard import dashboard_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(projects_bp, url_prefix='/api/projects')
app.register_blueprint(internships_bp, url_prefix='/api/internships')
app.register_blueprint(teams_bp, url_prefix='/api/teams')
app.register_blueprint(agreements_bp, url_prefix='/api/agreements')
app.register_blueprint(milestones_bp, url_prefix='/api/milestones')
app.register_blueprint(assessments_bp, url_prefix='/api/assessments')
app.register_blueprint(chat_bp, url_prefix='/api/chat')
app.register_blueprint(portfolio_bp, url_prefix='/api/portfolio')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

@app.route('/')
def home():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_frontend(path):
    try:
        return send_from_directory('../frontend', path)
    except:
        return send_from_directory('../frontend', 'index.html')

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, port=port)