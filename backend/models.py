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
    
    # Relationship with variations
    variations = db.relationship('Variation', back_populates='exercise', cascade="all, delete-orphan")
    
    # Association proxy to get routines through variations
    routines = association_proxy('variations', 'routine')
    
    # Serialization rules
    serialize_rules = ('-variations.exercise',)

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
    
    # Relationship with variations
    variations = db.relationship('Variation', back_populates='routine', cascade="all, delete-orphan")
    
    # Association proxy to get exercises through variations
    exercises = association_proxy('variations', 'exercise')
    
    # Serialization rules
    serialize_rules = ('-variations.routine',)
    
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

class Variation(db.Model, SerializerMixin):
    __tablename__ = 'variations'
    
    id = db.Column(db.Integer, primary_key=True)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercises.id'), nullable=False)
    routine_id = db.Column(db.Integer, db.ForeignKey('routines.id'), nullable=False)
    
    # Variation details - just name and variation_type (no sets, reps, etc.)
    name = db.Column(db.String(100), nullable=False)
    variation_type = db.Column(db.String(50), default='Standard')
    
    # Relationships
    exercise = db.relationship('Exercise', back_populates='variations')
    routine = db.relationship('Routine', back_populates='variations')
    
    # Serialization rules
    serialize_rules = ('-exercise.variations', '-routine.variations')
    
    # Validation for name
    @validates('name')
    def validate_name(self, key, name):
        if not name or len(name.strip()) == 0:
            raise ValueError("Variation name cannot be empty")
        if len(name) > 100:
            raise ValueError("Variation name must be less than 100 characters")
        return name
    
    def __repr__(self):
        return f"<Variation {self.name} of {self.exercise_id} in routine {self.routine_id}>"