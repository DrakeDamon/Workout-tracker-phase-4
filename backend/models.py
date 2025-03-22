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
  routines = db.relationship('Routine', backref='user', lazy=True, cascade="all, delete-orphan")

  