from flask import Flask, request, jsonify, session
from flask_cors import CORS
from models import db, User, Routine, Exercise, RoutineExercise
import os
from datetime import timedelta
from functools import wraps

# creates new flask web app
app = Flask(__name__)
#tells to use sqlalchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///workout_tracker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#sets up secret key for app for security
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-for-testing')

#allows other websites or apps to talk to it
CORS(app, supports_credentials=True)
#connects to db
db.init_app(app)