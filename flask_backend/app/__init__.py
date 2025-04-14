from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize PyMongo
mongo = PyMongo()

def create_app():
    app = Flask(__name__)
    
    # Configure MongoDB
    app.config["MONGO_URI"] = os.environ.get("MONGODB_URI")
    
    # Initialize CORS
    CORS(app)
    
    # Initialize MongoDB
    mongo.init_app(app)
    
    # Register blueprints
    from app.routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api')
    
    @app.route('/')
    def index():
        return 'PrepWise API is running'
    
    return app 