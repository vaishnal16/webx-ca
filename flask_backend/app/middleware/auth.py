from flask import request, jsonify
from functools import wraps
import jwt
from app.models.user import User
import os

def require_auth(f):
    """Decorator to protect routes requiring authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        # Get token from header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'status': 'error',
                'message': 'Not authorized to access this route'
            }), 401
        
        try:
            # Verify token
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, os.environ.get('JWT_SECRET'), algorithms=['HS256'])
            
            # Check if user exists
            user = User.find_by_id(payload['id'])
            if not user:
                return jsonify({
                    'status': 'error',
                    'message': 'User no longer exists'
                }), 401
            
            # Store user in request context
            request.current_user = user
            return f(*args, **kwargs)
        
        except jwt.ExpiredSignatureError:
            return jsonify({
                'status': 'error',
                'message': 'Token expired'
            }), 401
        
        except (jwt.InvalidTokenError, Exception):
            return jsonify({
                'status': 'error',
                'message': 'Not authorized to access this route'
            }), 401
    
    return decorated 