from werkzeug.security import generate_password_hash, check_password_hash
from app import mongo
from datetime import datetime
import re
import bson

class User:
    @staticmethod
    def create(email, password):
        """Create a new user with email and password"""
        # Validate email format
        if not re.match(r'^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$', email):
            raise ValueError("Please enter a valid email")
        
        # Check if email already exists
        if mongo.db.users.find_one({"email": email.lower()}):
            raise ValueError("Email already in use")
        
        # Validate password length
        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters")
        
        # Create user document
        user = {
            "email": email.lower(),
            "password": generate_password_hash(password),
            "createdAt": datetime.now()
        }
        
        result = mongo.db.users.insert_one(user)
        user['_id'] = result.inserted_id
        return user
    
    @staticmethod
    def find_by_email(email):
        """Find a user by email"""
        return mongo.db.users.find_one({"email": email.lower()})
    
    @staticmethod
    def find_by_id(user_id):
        """Find a user by ID"""
        if not isinstance(user_id, bson.ObjectId):
            try:
                user_id = bson.ObjectId(user_id)
            except:
                return None
        return mongo.db.users.find_one({"_id": user_id})
    
    @staticmethod
    def check_password(user, password):
        """Check if password matches the user's password"""
        if not user or not password:
            return False
        return check_password_hash(user['password'], password) 