from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
  #connects a table to db called users
  __tablename__ = 'users'
  #unique means it cant be replicated and nullable means there must an entry
  id = db.Column(db.Integer, primary_key=True)
  username = db.Column(db.String(80), unique=True, nullable=False)
  password_hash = db.Column(db.String(128), nullable=False)

  #Relationship routes
  #user can have many routines and routines can look at which user it belongs
  #lazy means dont load routines until needed
  #cascade controls what happens to routines when changes occur
  routines = db.relationship('Routine', backref='user', lazy=True, cascade="all, delete-orphan")

  #scrambles password
  def set_password(self, password):
    self.password_hash = generate_password_hash(password)
  #checks to see if password match
  def check_password(self, password):
    return check_password_hash(self.password_hash, password)
  
  #takes username and changes to key-value pairs
  def to_dict(self):
    return {
      'id': self.id,
      'username': self.username
    }
  
class Excersice(db.model):
  __tablename__ = 'exercises'

  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String(100), nullable=True)
  description = db.Column(db.Text)
  muscle_group = db.Column(db.String(50))
  equipment = db.Column(db.String(100))

  #Relationship with routine exercises
  #one to many (first part to many to many)
  routine_exercises = db.relationship('RoutineExercise', backref='exercise', lazy=True, cascade="all, delete-orphan")

  def to_dict(self):
    return {
      'id': self.id,
      'name': self.name,
      'description': self.description,
      'muscle_group': self.muscle_group,
      'equiptment': self.equipment
    }
  
class Routine(db.Model):
  __tablename__ = 'routines'


  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String(100), nullable=False)
  day_of_week = db.Column(db.String(10))
  description = db.Column(db.Text)
  created_at = db.Column(db.Datetime, default= datetime.datetime.now(datetime.UTC))
  updated_at = db.Column(db.Datetime, default=datetime.datetime.now(datetime.UTC), onupdate=datetime.datetime.now(datetime.UTC))
  user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)


  #Relationship wiht routine exercises
  routine_exercises = db.relationship('RoutineExercise', backref='routine', lazy=True, cascade="all, delete-orphan")

  def to_dict(self):
    return {
      'id': self.id,
      'name': self.name,
      'day_of_week': self.day_of_week,
      'description': self.description,
      #isoformat turns into a simple string
      'created_at': self.created_at.isoformat
      (),
      'updated_at': self.updated_at.isoformat(),
      'user_id': self.user_id,
      #turns exercies into dictionaries and puts into a list
      'exercises': [re.to_dict() for re in self.routine_exercises]
    }
  
class RoutineExercise(db.Model):
  __tablename__ = 'routine_exercises'

  id = db.Column(db.Integer, primary_key=True)
  routine_id = db.Column(db.Integer, db.ForeignKey('routines.id'), nullable=False)
  exercise_id = db.Column(db.Integer, db.ForeignKey('exercise.id'), nullable=False)
  sets = db.Column(db.Integer, default= 2)
  reps = db.Column(db.Integer, default=8)
  weight = db.Column(db.Float)
  notes = db.Column(db.Text)
  order = db.Column(db.Integer)

  def to_dict(self):
    return {
        'id': self.id,
        'routine_id': self.routine_id,
        'exercise_id': self.exercise_id,
        'exercise': self.exercise.to_dict(),
        'sets': self.sets,
        'reps': self.reps,
        'weight': self.weight,
        'notes': self.notes,
        'order': self.order
    }



  

