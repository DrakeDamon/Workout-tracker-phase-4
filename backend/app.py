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

# If a user tries to access a protected route without logging in
@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({'error': 'Authentication required'}), 401

# Authentication routes
# Route to log a user in
# URL: /api/login (POST)
# Checks username and password, logs the user in if correct
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

# Logout
# URL: /api/logout (POST)
@app.route('/api/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({'message': 'Logout successful'})

# Check if user is logged in
# URL: /api/check-auth (GET)
@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    if current_user.is_authenticated:
        return jsonify({'authenticated': True, 'user': current_user.to_dict()})
    return jsonify({'authenticated': False}), 401

# -- ROUTINE ROUTES --
# Route to get a specific routine
# URL: /api/routines/1 (GET)
@app.route('/api/routines/<int:routine_id>', methods=['GET'])
@login_required
def get_routine(routine_id):
    routine = Routine.query.filter_by(id=routine_id, user_id=current_user.id).first()

    if not routine:
        return jsonify({'error': 'Routine not found'}), 404
    return jsonify(routine.to_dict())

# Route to create a new routine
# URL: /api/routines (POST)
@app.route('/api/routines', methods=['POST'])
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

# Route to update a routine
# URL: /api/routines/1 (PUT)
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

# Route to delete a routine
# URL: /api/routines/1 (DELETE)
@app.route('/api/routines/<int:routine_id>', methods=['DELETE'])
@login_required
def delete_routine(routine_id):
    routine = Routine.query.filter_by(id=routine_id, user_id=current_user.id).first()

    if not routine:
        return jsonify({'error': 'Routine not found'}), 404
    
    db.session.delete(routine)
    db.session.commit()

    return jsonify({'message': 'Routine deleted successfully'})

# -- EXERCISE ROUTES --
# Route to get a list of exercises
@app.route('/api/exercises', methods=['GET'])
@login_required
def get_exercises():
    # Get any filters from the URL (like ?muscle_group=chest or ?search=push)
    muscle_group = request.args.get('muscle_group')
    equipment = request.args.get('equipment')
    search = request.args.get('search')
    
    # Start with all exercises
    query = Exercise.query
    
    # Apply filters if provided
    if muscle_group:
        query = query.filter(Exercise.muscle_group == muscle_group)
    if equipment:
        query = query.filter(Exercise.equipment == equipment)
    if search:
        # Search for exercises with a name containing the search term (case-insensitive)
        query = query.filter(Exercise.name.ilike(f'%{search}%'))
    
    # Get the filtered list of exercises
    exercises = query.all()
    # Send back the list of exercises as a JSON array
    return jsonify([exercise.to_dict() for exercise in exercises])

# Route to get a specific exercise
@app.route('/api/exercises/<int:exercise_id>', methods=['GET'])
@login_required
def get_exercise(exercise_id):
    # Find the exercise with the given ID
    exercise = Exercise.query.get(exercise_id)
    
    # If the exercise doesn't exist, send an error
    if not exercise:
        return jsonify({'error': 'Exercise not found'}), 404
    
    # Send back the exercise's details
    return jsonify(exercise.to_dict())

# Route to create a new exercise
# URL: /api/exercises (POST)
# What it does: Creates a new exercise in the database
@app.route('/api/exercises', methods=['POST'])
@login_required
def create_exercise():
    # Get the data sent by the frontend
    data = request.get_json()
    
    # Create a new exercise with the provided details
    exercise = Exercise(
        name=data['name'],  # The name is required
        description=data.get('description'),  # Description is optional
        muscle_group=data.get('muscle_group'),  # Muscle group is optional
        equipment=data.get('equipment')  # Equipment is optional
    )
    
    # Save the new exercise to the database
    db.session.add(exercise)
    db.session.commit()

    return jsonify(exercise.to_dict()), 201

# -- Routine Exercise Routes
# Route to add an exercise to routine
@app.route('/api/routines/<int:routine_id>/exercises', methods=['POST'])
@login_required
def add_exercise_to_routine(routine_id):
    routine = Routine.query.filter_by(id=routine_id, user_id=current_user.id).first()
    
    if not routine:
        return jsonify({'error': 'Routine not found'}), 404
    
    data = request.get_json()
    exercise_id = data['exercise_id']
    
    exercise = Exercise.query.get(exercise_id)
    if not exercise:
        return jsonify({'error': 'Exercise not found'}), 404
    
    max_order = db.session.query(db.func.max(RoutineExercise.order)).filter_by(routine_id=routine_id).scalar() or 0
    
    routine_exercise = RoutineExercise(
        routine_id=routine_id,
        exercise_id=exercise_id,
        sets=data.get('sets', 2), 
        reps=data.get('reps', 8),
        weight=data.get('weight'),
        notes=data.get('notes'), 
        order=max_order + 1  
    )
    
    db.session.add(routine_exercise)
    db.session.commit()
    
    return jsonify(routine_exercise.to_dict()), 201

# Route to update an exercise in routine
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

# Route to remove an exercise from a routine
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

# -- Utility Routes --
# Route to get a list of muscle groups
@app.route('/api/muscle-groups', methods=['GET'])
@login_required
def get_muscle_groups():
    # Get all unique muscle groups from the exercises table
    muscle_groups = db.session.query(Exercise.muscle_group).distinct().all()
    # Send back the list, filtering out any empty values
    return jsonify([mg[0] for mg in muscle_groups if mg[0]])

# Route to get a list of equipment
@app.route('/api/equipment', methods=['GET'])
@login_required
def get_equipment():
    # Get all unique equipment from the exercises table
    equipment_list = db.session.query(Exercise.equipment).distinct().all()
    # Send back the list, filtering out any empty values
    return jsonify([eq[0] for eq in equipment_list if eq[0]])

# Start the app
if __name__ == '__main__':
    # Create the database tables if they don't exist
    with app.app_context():
        db.create_all()
    # Run the app in debug mode (shows errors and auto-reloads on changes)
    app.run(debug=True)