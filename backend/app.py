from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_login import LoginManager, login_required, login_user, logout_user, current_user
from models import db, User, Routine, Exercise, RoutineExercise
import os
from datetime import timedelta

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///workout_tracker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-for-testing')
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)

# Allow the frontend (React) to talk to the backend (Flask) even if they're on different domains
CORS(app, supports_credentials=True)
db.init_app(app)

# Set up Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.session_protection = "strong"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

#If a user tries to access a protected route wihtout logging in
@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({'error': 'Authentication required'}), 401

# Authentication routes
#Route to log a user in
#URL: /API/LOGIN (POST)
#Checks username and password, logs the user in if correct
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    
    user = User.query.filter_by(username=username).first()
    
    if user and user.check_password(password):
        login_user(user, remember=True)
        return jsonify({'message': 'Login successful', 'user': user.to_dict()})
    
    return jsonify({'error': 'Invalid credentials'}), 401


#Logout
# URL: /API/LOGOUT (POST)

@app.route('/api/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({'message': 'Logout successful'})

#Check if user is logged in
#URL: /API/CHECK-AUTH (GET)
@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    if current_user.is_authenticated:
        return jsonify({'authenticated': True, 'user': current_user.to_dict()})
    return jsonify({'authenticated': False}), 401

# -- ROUTINE ROUTES --
# Route to get a specific routine
# URL: /api/routines/1 (GET)
@app.route('/api/routines/<int:routine_id>', methods=[GET])
@login_required
def get_routine(routine_id):
    routine = Routine.query.filter_by(id=routine_id, user_id=current_user.id).first()

    if not routine:
        return jsonify({'error': 'Routine not found'}), 404
    return jsonify(routine.to_dict())

#Route to create a new routine
#URL: /API/ROUTINES (POST)
@app.route('api/routines', methods=['POST'])
@login_required
def create_routine():
    data = request.get_json()

    routine = Routine(
        name=data['name'],
        day_of_week=data.get('day_of_week'),
        description=data.get('description'),
        user_id=current_user.id
    )
    
    db.session.add(routine)
    db.session.commit()

    return jsonify(routine.to_dict()), 201

#Route to update a routine
#URL: /API/ROUTINES/1 (PUT)
@app.route('/api/routines/<int:routine_id>', methods=['PUT'])
@login_required
def update_routine(routine_id):
    
    routine = Routine.query.filter_by(id=routine_id, user_id=current_user.id).first()

    if not routine:
        return jsonify({'error': 'Routine not found'}), 404
    
    data = request.get_json()

    routine.name = data.get('name', routine.name)
    routine.day_of_week = data.get('day_of_week', routine.day_of_week)
    routine.description = data.get('description', routine.description)

    db.session.commit()
    return jsonify(routine.to_dict())

#Route to delete a routine
#URL: /API/ROUTINES/1 (DELETE)
@app.routes('/api/routines/<int:routine_id>', methods=['DELETE'])
@login_required
def delete_routine(routine_id):
    routine= Routine.query.filter_by(id=routine_id, user_id=current_user.id).first()

    if not routine:
        return jsonify({'error': 'Routine not found'}), 404
    
    db.session.delete(routine)
    db.session.commit()

    return jsonify({'message': 'Routine deleted successfully'})

# -- EXERCISE ROUTES --
# Route to add an exercise to routine
@app.route('api/routines/<int:routine_id>/exercises', methods=['POST'])
@login_required
def add_exercise_to_routine(routine.id):
    routine = Routine.query.filter_by(id=routine_id, user_id=current_user.id).first()

    if not routine:
        return jsonify({'error': 'Routine not found'}), 404
    
    data = request.get_json()
    exercise_id=data['exercise_id']

    exercise = Exercise.query.get(exercise_id)
    if not exercise:
        return jsonify({'error': 'Exercise not found'}), 404
    
    #find highest order number for exercise (to add new one at end)
    max_order = db.session.query(db.func.max[RoutineExercise.order]).filter_by(routine_id=routine_id).scalar() or 0

    routine_exercise = RoutineExercise(
        routine_id=routine_id,
        exercise_id=exercise_id,
        sets=data.get('sets', 3), 
        reps=data.get('reps', 10), 
        weight=data.get('weight'), 
        notes=data.get('notes'),
        order=max_order + 1 
    )

    db.session.add(routine_exercise)
    db.session.commit()

    return jsonify(RoutineExercise.to_dict()), 201

#Route to update an exercise in routine
@app.route('/api/routine-exercises/<int:routine_exercise_id>', methods=['PUT'])
@login_required
def update_routine_exercise(routine_exercise_id):
    routine_exercise = RoutineExercise.query.join(Routine).filter(
        RoutineExercise.id == routine_exercise_id,
        Routine.user_id == current_user.id
    ).first()
    

    if not routine_exercise:
        return jsonify({'error': 'Routine exercise not found'}), 404
    
    data = request.get_json()
    
    routine_exercise.sets = data.get('sets', routine_exercise.sets)
    routine_exercise.reps = data.get('reps', routine_exercise.reps)
    routine_exercise.weight = data.get('weight', routine_exercise.weight)
    routine_exercise.notes = data.get('notes', routine_exercise.notes)
    routine_exercise.order = data.get('order', routine_exercise.order)
    
    db.session.commit()
    
    return jsonify(routine_exercise.to_dict())

# Route to remove and exercise from a routine
@app.route('/api/routine-exercises/<int:routine_exercise_id>', methods=['DELETE'])
@login_required
def delete_routine_exercise(routine_exercise_id):
    routine_exercise = RoutineExercise.query.join(Routine).filter(
        RoutineExercise.id == routine_exercise_id,
        Routine.user_id == current_user.id
    ).first()
    
    if not routine_exercise:
        return jsonify({'error': 'Routine exercise not found'}), 404
    
    db.session.delete(routine_exercise)
    db.session.commit()
    
    return jsonify({'message': 'Exercise removed from routine successfully'})