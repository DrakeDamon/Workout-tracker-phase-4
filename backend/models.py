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
  



  

