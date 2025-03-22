from flask import Flask, request, jsonify, session
from flask_cors import CORS
from models import db, User, Routine, Exercise, RoutineExercise
import os
from datetime import timedelta
from functools import wraps