from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    # One-to-many relationship with Routine
    routines = db.relationship('Routine', backref='owner', lazy=True, cascade="all, delete-orphan")

    serialize_rules = ('-routines.owner',)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    # Flask-Login required methods
    @property
    def is_authenticated(self):
        return True

    @property
    def is_active(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return str(self.id)

class Exercise(db.Model):
    __tablename__ = 'exercises'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    muscle_group = db.Column(db.String(50))
    equipment = db.Column(db.String(100))

    # Relationship with RoutineExercise
    routine_exercises = db.relationship('RoutineExercise', backref='exercise', lazy=True)

    serialize_rules = ('-routine_exercises.exercise',)

class Routine(db.Model):
    __tablename__ = 'routines'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    day_of_week = db.Column(db.String(10))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, onupdate=lambda: datetime.now(timezone.utc))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationship with RoutineExercise
    routine_exercises = db.relationship('RoutineExercise', backref='routine', lazy=True, cascade="all, delete-orphan")

    serialize_rules = ('-routine_exercises.routine', '-owner')

class RoutineExercise(db.Model):
    __tablename__ = 'routine_exercises'

    id = db.Column(db.Integer, primary_key=True)
    routine_id = db.Column(db.Integer, db.ForeignKey('routines.id'), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercises.id'), nullable=False)
    sets = db.Column(db.Integer, default=2)
    reps = db.Column(db.Integer, default=8)
    weight = db.Column(db.Float)
    notes = db.Column(db.Text)
    order = db.Column(db.Integer)
    
    serialize_rules = ('-routine.routine_exercises', '-exercise.routine_exercises')