from app import app, db
from models import User, Routine, Exercise, RoutineExercise

def seed_database():
    with app.app_context():
        # Clear existing data (optional, comment out if you want to keep existing data)
        db.drop_all()
        db.create_all()

        # Create a test user
        print("Creating default user...")
        # Remove the email parameter
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

if __name__ == '__main__':
    seed_database()