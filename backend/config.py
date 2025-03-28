import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class Config:
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///workout_tracker.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your_very_secret_key_here')
    

    
    # CORS configuration
    CORS_ORIGINS = [
        'http://localhost:3000', 
        'http://127.0.0.1:3000'
    ]
    CORS_SUPPORTS_CREDENTIALS = True
    CORS_HEADERS = [
        'Content-Type', 
        'Authorization', 
        'Access-Control-Allow-Credentials'
    ]
    CORS_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']