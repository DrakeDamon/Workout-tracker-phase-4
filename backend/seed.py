from flask import Flask
import os
from models import db, User, Exercise, Routine, RoutineExercise

# Create a Flask app to use for creating the database
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///workout_tracker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-for-testing')

db.init_app(app)

def seed_database():
    with app.app_context():
        # Drop all tables and re-create them
        db.drop_all()
        db.create_all()
        
        print("Creating default user...")
        
        # Create default user
        user = User(username="admin")
        user.set_password("password")
        db.session.add(user)
        db.session.commit()
        
        print("Creating exercise library...")
        
        # Create exercise library
        exercises = [
            Exercise(name="Bench Press", description="Lie on a flat bench and press weight upward", muscle_group="Chest", equipment="Barbell"),
            Exercise(name="Squat", description="Lower your body by bending your knees and hips", muscle_group="Legs", equipment="Barbell"),
            Exercise(name="Deadlift", description="Lift a weight from the floor to hip level", muscle_group="Back", equipment="Barbell"),
            Exercise(name="Pull-up", description="Lift your body using an overhead bar", muscle_group="Back", equipment="Bodyweight"),
            Exercise(name="Push-up", description="Lower and raise your body using your arms", muscle_group="Chest", equipment="Bodyweight"),
            Exercise(name="Dumbbell Curl", description="Flex your elbow to lift a weight", muscle_group="Arms", equipment="Dumbbell"),
            Exercise(name="Tricep Extension", description="Extend your elbow against resistance", muscle_group="Arms", equipment="Cable"),
            Exercise(name="Overhead Press", description="Press weight overhead", muscle_group="Shoulders", equipment="Barbell"),
            Exercise(name="Lat Pulldown", description="Pull a bar down to chest level", muscle_group="Back", equipment="Cable"),
            Exercise(name="Leg Press", description="Press weight away using your legs", muscle_group="Legs", equipment="Machine"),
            Exercise(name="Leg Curl", description="Flex your knees against resistance", muscle_group="Legs", equipment="Machine"),
            Exercise(name="Plank", description="Hold a pushup position with straight arms", muscle_group="Core", equipment="Bodyweight"),
            Exercise(name="Russian Twist", description="Rotate your torso while seated", muscle_group="Core", equipment="Bodyweight"),
            Exercise(name="Lateral Raise", description="Raise weights out to the sides", muscle_group="Shoulders", equipment="Dumbbell"),
            Exercise(name="Calf Raise", description="Raise up onto your toes", muscle_group="Legs", equipment="Machine"),
        ]
        
        db.session.add_all(exercises)
        db.session.commit()
        
        print("Creating sample routines...")
        
        # Create sample routines
        routines = [
            Routine(name="Upper Body", day_of_week="Monday", description="Focus on chest, back, and arms", user_id=user.id),
            Routine(name="Lower Body", day_of_week="Wednesday", description="Focus on legs and core", user_id=user.id),
            Routine(name="Full Body", day_of_week="Friday", description="Work all major muscle groups", user_id=user.id),
        ]
        
        db.session.add_all(routines)
        db.session.commit()
        
        print("Adding exercises to routines...")
        
        # Add exercises to the upper body routine
        upper_body_exercises = [
            RoutineExercise(routine_id=1, exercise_id=1, sets=3, reps=10, weight=135, order=1),  # Bench Press
            RoutineExercise(routine_id=1, exercise_id=9, sets=3, reps=12, order=2),  # Lat Pulldown
            RoutineExercise(routine_id=1, exercise_id=6, sets=3, reps=12, weight=25, order=3),  # Dumbbell Curl
            RoutineExercise(routine_id=1, exercise_id=7, sets=3, reps=12, order=4),  # Tricep Extension
            RoutineExercise(routine_id=1, exercise_id=8, sets=3, reps=10, weight=95, order=5),  # Overhead Press
        ]
        
        # Add exercises to the lower body routine
        lower_body_exercises = [
            RoutineExercise(routine_id=2, exercise_id=2, sets=3, reps=8, weight=185, order=1),  # Squat
            RoutineExercise(routine_id=2, exercise_id=10, sets=3, reps=12, order=2),  # Leg Press
            RoutineExercise(routine_id=2, exercise_id=11, sets=3, reps=12, order=3),  # Leg Curl
            RoutineExercise(routine_id=2, exercise_id=15, sets=3, reps=15, order=4),  # Calf Raise
            RoutineExercise(routine_id=2, exercise_id=12, sets=3, reps=30, notes="Hold for 30 seconds", order=5),  # Plank
        ]
        
        # Add exercises to the full body routine
        full_body_exercises = [
            RoutineExercise(routine_id=3, exercise_id=1, sets=3, reps=10, weight=135, order=1),  # Bench Press
            RoutineExercise(routine_id=3, exercise_id=2, sets=3, reps=8, weight=185, order=2),  # Squat
            RoutineExercise(routine_id=3, exercise_id=3, sets=3, reps=8, weight=225, order=3),  # Deadlift
            RoutineExercise(routine_id=3, exercise_id=8, sets=3, reps=10, weight=95, order=4),  # Overhead Press
            RoutineExercise(routine_id=3, exercise_id=12, sets=3, reps=30, notes="Hold for 30 seconds", order=5),  # Plank
        ]
        
        db.session.add_all(upper_body_exercises)
        db.session.add_all(lower_body_exercises)
        db.session.add_all(full_body_exercises)
        db.session.commit()
        
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()