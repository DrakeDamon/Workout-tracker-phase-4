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

