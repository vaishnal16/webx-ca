from flask import Blueprint, request, jsonify
from app.models.user import User
import jwt
import os
import datetime

auth_bp = Blueprint('auth', __name__)

def sign_token(user_id):
    """Generate a JWT token for authentication"""
    return jwt.encode(
        {
            'id': str(user_id),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
        },
        os.environ.get('JWT_SECRET'),
        algorithm='HS256'
    )

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Register a new user"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                'status': 'error',
                'message': 'Please provide email and password'
            }), 400
        
        try:
            user = User.create(data.get('email'), data.get('password'))
        except ValueError as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 400
        
        token = sign_token(user['_id'])
        
        return jsonify({
            'status': 'success',
            'token': token,
            'data': {
                'user': {
                    'id': str(user['_id']),
                    'email': user['email']
                }
            }
        }), 201
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    """Log in a user"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({
                'status': 'error',
                'message': 'Please provide email and password'
            }), 400
        
        user = User.find_by_email(data.get('email'))
        
        if not user or not User.check_password(user, data.get('password')):
            return jsonify({
                'status': 'error',
                'message': 'Incorrect email or password'
            }), 401
        
        token = sign_token(user['_id'])
        
        return jsonify({
            'status': 'success',
            'token': token,
            'data': {
                'user': {
                    'id': str(user['_id']),
                    'email': user['email']
                }
            }
        }), 200
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400 