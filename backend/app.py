from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_login import LoginManager, login_required, login_user, logout_user, current_user
from models import db, User, Routine, Exercise, RoutineExercise
import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Use environment variable for database URI (for production compatibility)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///workout_tracker.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-for-testing')
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
# Production-ready session settings
app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # Required for cross-origin in production
app.config['SESSION_COOKIE_SECURE'] = True  # Requires HTTPS in production
app.config['SESSION_COOKIE_HTTPONLY'] = True

# Update CORS for production (will be updated with actual frontend domain in deployment)
CORS(app, supports_credentials=True, origins=['http://localhost:3000'])

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
@login_required
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

# Database Seeding Logic
def seed_database():
    # Check if data already exists
    if User.query.first() or Exercise.query.first():
        print("Database already contains data. Skipping seeding.")
        return

    # Create a test user
    print("Creating default user...")
    user = User(username='testuser')
    user.set_password('testpassword')
    db.session.add(user)

    # Create some exercises
    print("Creating exercise library...")
    exercises = [
        Exercise(
            name='Push-Up',
            description='A bodyweight exercise for chest and triceps',
            muscle_group='Chest',
            equipment='None'
        ),
        Exercise(
            name='Squat',
            description='A bodyweight exercise for legs',
            muscle_group='Legs',
            equipment='None'
        ),
        Exercise(
            name='Dumbbell Curl',
            description='An exercise for biceps using dumbbells',
            muscle_group='Arms',
            equipment='Dumbbells'
        ),
        Exercise(
            name='Bench Press',
            description='A compound exercise for chest',
            muscle_group='Chest',
            equipment='Barbell'
        ),
    ]
    db.session.add_all(exercises)

    # Commit the user and exercises to get their IDs
    db.session.commit()

    # Create routines for the test user
    print("Creating sample routines...")
    routines = [
        Routine(
            name='Upper Body',
            day_of_week='Monday',
            description='Focus on chest, back, and arms',
            user_id=user.id
        ),
        Routine(
            name='Lower Body',
            day_of_week='Wednesday',
            description='Focus on legs and core',
            user_id=user.id
        ),
        Routine(
            name='Full Body',
            day_of_week='Friday',
            description='Work all major muscle groups',
            user_id=user.id
        ),
    ]
    db.session.add_all(routines)

    # Commit the routines to get their IDs
    db.session.commit()

    # Create some routine exercises
    routine_exercises = [
        RoutineExercise(
            routine_id=routines[0].id,  # Upper Body
            exercise_id=exercises[0].id,  # Push-Up
            sets=3,
            reps=10,
            weight=None,
            notes='Focus on form',
            order=1
        ),
        RoutineExercise(
            routine_id=routines[0].id,  # Upper Body
            exercise_id=exercises[2].id,  # Dumbbell Curl
            sets=3,
            reps=12,
            weight=20.0,
            notes='Use moderate weight',
            order=2
        ),
        RoutineExercise(
            routine_id=routines[1].id,  # Lower Body
            exercise_id=exercises[1].id,  # Squat
            sets=4,
            reps=8,
            weight=None,
            notes='Bodyweight only',
            order=1
        ),
        RoutineExercise(
            routine_id=routines[2].id,  # Full Body
            exercise_id=exercises[3].id,  # Bench Press
            sets=3,
            reps=8,
            weight=135.0,
            notes='Start light',
            order=1
        ),
    ]
    db.session.add_all(routine_exercises)

    # Final commit
    db.session.commit()
    print("Database seeded successfully!")

# Start the app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed_database()
    app.run(debug=True, host='localhost', port=5555)