from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime, timezone

# Define metadata with naming convention for foreign keys
metadata = MetaData(
    naming_convention={
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    }
)

db = SQLAlchemy(metadata=metadata)

class Exercise(db.Model, SerializerMixin):
    __tablename__ = 'exercises'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    muscle_group = db.Column(db.String(50))
    equipment = db.Column(db.String(100))
    
    # Define relationship - one side of one-to-many with RoutineExercise
    routine_exercises = db.relationship('RoutineExercise', back_populates='exercise')
    
    # Association proxy to get routines through routine_exercises
    routines = association_proxy('routine_exercises', 'routine')
    
    # Serialization rules
    serialize_rules = ('-routine_exercises.exercise',)
    
    # Validation for name
    @validates('name')
    def validate_name(self, key, name):
        if not name or len(name.strip()) == 0:
            raise ValueError("Exercise name cannot be empty")
        if len(name) > 100:
            raise ValueError("Exercise name must be less than 100 characters")
        return name
    
    def __repr__(self):
        return f"<Exercise {self.name}>"

class Routine(db.Model, SerializerMixin):
    __tablename__ = 'routines'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    day_of_week = db.Column(db.String(10))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, onupdate=lambda: datetime.now(timezone.utc))
    
    # Define relationship - one side of one-to-many with RoutineExercise
    routine_exercises = db.relationship('RoutineExercise', back_populates='routine', cascade="all, delete-orphan")
    
    # Association proxy to get exercises through routine_exercises
    exercises = association_proxy('routine_exercises', 'exercise')
    
    # Serialization rules
    serialize_rules = ('-routine_exercises.routine',)
    
    # Validation for name
    @validates('name')
    def validate_name(self, key, name):
        if not name or len(name.strip()) == 0:
            raise ValueError("Routine name cannot be empty")
        if len(name) > 100:
            raise ValueError("Routine name must be less than 100 characters")
        return name
    
    def __repr__(self):
        return f"<Routine {self.name}>"

class RoutineExercise(db.Model, SerializerMixin):
    __tablename__ = 'routine_exercises'
    
    id = db.Column(db.Integer, primary_key=True)
    routine_id = db.Column(db.Integer, db.ForeignKey('routines.id'), nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercises.id'), nullable=False)
    
    # User-submittable attributes
    sets = db.Column(db.Integer, default=3)
    reps = db.Column(db.Integer, default=10)
    weight = db.Column(db.Float)  # in pounds or kg
    notes = db.Column(db.Text)    # additional notes for this exercise
    order = db.Column(db.Integer) # order of exercises in the routine
    
    # Define both sides of the relationships
    routine = db.relationship('Routine', back_populates='routine_exercises')
    exercise = db.relationship('Exercise', back_populates='routine_exercises')
    
    # Serialization rules
    serialize_rules = ('-routine.routine_exercises', '-exercise.routine_exercises')
    
    # Validation for sets and reps
    @validates('sets', 'reps')
    def validate_counts(self, key, value):
        if value is not None and value < 1:
            raise ValueError(f"{key} must be at least 1")
        return value
    
    # Validation for weight
    @validates('weight')
    def validate_weight(self, key, value):
        if value is not None and value < 0:
            raise ValueError("Weight cannot be negative")
        return value
    
    def __repr__(self):
        return f"<RoutineExercise {self.exercise_id} in {self.routine_id}>"