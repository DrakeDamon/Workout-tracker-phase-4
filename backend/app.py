from flask import Flask, request, jsonify, session
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
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False  # For local HTTP
app.config['SESSION_COOKIE_HTTPONLY'] = True

CORS(app, supports_credentials=True, origins=['http://localhost:3000'])  # Specific origin

db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.session_protection = "strong"

@login_manager.user_loader
def load_user(user_id):
    print('Loading user:', user_id, 'Type:', type(user_id))
    user = User.query.get(int(user_id))
    print('Loaded user:', user)
    return user

@login_manager.unauthorized_handler
def unauthorized():
    print('Unauthorized access - Current user:', current_user, 'Authenticated:', current_user.is_authenticated)
    print('Session:', session)
    return jsonify({'error': 'Authentication required'}), 401

@app.route('/')
def index():
    return jsonify({'message': 'Welcome to Workout Tracker API'})

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
        print('After login - User:', current_user, 'Authenticated:', current_user.is_authenticated)
        print('After login - Session:', session)
        return jsonify({'message': 'Login successful', 'user': user.to_dict()})
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    logout_user()
    session.clear()
    return jsonify({'message': 'Logout successful'})

@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    if current_user.is_authenticated:
        return jsonify({'authenticated': True, 'user': current_user.to_dict()}), 200
    return jsonify({'authenticated': False}), 200

@app.route('/api/user-data', methods=['GET'])
@login_required  # Moved outside inner function
def get_user_data():
    print('Received /api/user-data request')
    print('Session cookie:', request.cookies.get('session'))
    print('User data requested for:', current_user, 'Authenticated:', current_user.is_authenticated)
    routines = Routine.query.filter_by(user_id=current_user.id).all()
    exercises = Exercise.query.all()
    muscle_groups = db.session.query(Exercise.muscle_group).distinct().all()
    equipment_list = db.session.query(Exercise.equipment).distinct().all()
    return jsonify({
        'routines': [routine.to_dict() for routine in routines],
        'exercises': [exercise.to_dict() for exercise in exercises],
        'muscle_groups': [mg[0] for mg in muscle_groups if mg[0]],
        'equipment': [eq[0] for eq in equipment_list if eq[0]]
    })


# Routine Routes
@app.route('/api/routines/<int:routine_id>', methods=['GET'])
@login_required
def get_routine(routine_id):
    routine = Routine.query.filter_by(id=routine_id, user_id=current_user.id).first()
    if not routine:
        return jsonify({'error': 'Routine not found'}), 404
    return jsonify(routine.to_dict())

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

@app.route('/api/routines/<int:routine_id>', methods=['DELETE'])
@login_required
def delete_routine(routine_id):
    routine = Routine.query.filter_by(id=routine_id, user_id=current_user.id).first()
    if not routine:
        return jsonify({'error': 'Routine not found'}), 404
    db.session.delete(routine)
    db.session.commit()
    return jsonify({'message': 'Routine deleted successfully'})

# Exercise Routes
@app.route('/api/exercises', methods=['GET'])
@login_required
def get_exercises():
    muscle_group = request.args.get('muscle_group')
    equipment = request.args.get('equipment')
    search = request.args.get('search')
    query = Exercise.query
    if muscle_group:
        query = query.filter(Exercise.muscle_group == muscle_group)
    if equipment:
        query = query.filter(Exercise.equipment == equipment)
    if search:
        query = query.filter(Exercise.name.ilike(f'%{search}%'))
    exercises = query.all()
    return jsonify([exercise.to_dict() for exercise in exercises])

@app.route('/api/exercises/<int:exercise_id>', methods=['GET'])
@login_required
def get_exercise(exercise_id):
    exercise = Exercise.query.get(exercise_id)
    if not exercise:
        return jsonify({'error': 'Exercise not found'}), 404
    return jsonify(exercise.to_dict())

@app.route('/api/exercises', methods=['POST'])
@login_required
def create_exercise():
    data = request.get_json()
    exercise = Exercise(
        name=data['name'],
        description=data.get('description'),
        muscle_group=data.get('muscle_group'),
        equipment=data.get('equipment')
    )
    db.session.add(exercise)
    db.session.commit()
    return jsonify(exercise.to_dict()), 201

# Routine Exercise Routes
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

# Utility Routes
@app.route('/api/muscle-groups', methods=['GET'])
@login_required
def get_muscle_groups():
    muscle_groups = db.session.query(Exercise.muscle_group).distinct().all()
    return jsonify([mg[0] for mg in muscle_groups if mg[0]])

@app.route('/api/equipment', methods=['GET'])
@login_required
def get_equipment():
    equipment_list = db.session.query(Exercise.equipment).distinct().all()
    return jsonify([eq[0] for eq in equipment_list if eq[0]])

# Start the app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5555)