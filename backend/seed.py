from app import app, db
from models import Exercise, Routine, RoutineExercise

def seed_database():
    """Seed the database with initial data"""
    with app.app_context():
        print("Seeding database...")
        
        db.session.query(RoutineExercise).delete()
        db.session.query(Exercise).delete()
        db.session.query(Routine).delete()
        db.session.commit()
        
        print("Creating exercises...")
        # Create exercises
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
            Exercise(
                name='Deadlift',
                description='A compound exercise that works multiple muscle groups',
                muscle_group='Back',
                equipment='Barbell'
            ),
            Exercise(
                name='Lat Pulldown',
                description='An exercise for back and biceps',
                muscle_group='Back',
                equipment='Cable Machine'
            ),
            Exercise(
                name='Leg Press',
                description='A machine exercise for quadriceps and glutes',
                muscle_group='Legs',
                equipment='Machine'
            ),
            Exercise(
                name='Overhead Press',
                description='A compound exercise for shoulders',
                muscle_group='Shoulders',
                equipment='Barbell'
            ),
            Exercise(
                name='Plank',
                description='An isometric core exercise that improves stability',
                muscle_group='Core',
                equipment='None'
            ),
            Exercise(
                name='Tricep Dip',
                description='An exercise that targets the triceps',
                muscle_group='Arms',
                equipment='Parallel Bars'
            ),
        ]
        db.session.add_all(exercises)
        db.session.commit()
        
        print("Creating routines...")
        # Create routines
        routines = [
            Routine(
                name='Upper Body',
                day_of_week='Monday',
                description='Focus on chest, back, and arms'
            ),
            Routine(
                name='Lower Body',
                day_of_week='Wednesday',
                description='Focus on legs and core'
            ),
            Routine(
                name='Full Body',
                day_of_week='Friday',
                description='Work all major muscle groups'
            ),
        ]
        db.session.add_all(routines)
        db.session.commit()
        
        print("Adding exercises to routines...")
        # Add exercises to routines
        routine_exercises = [
            # Upper Body routine
            RoutineExercise(
                routine_id=routines[0].id,
                exercise_id=exercises[0].id,  # Push-Up
                sets=3,
                reps=10,
                weight=None,
                notes='Focus on form',
                order=1
            ),
            RoutineExercise(
                routine_id=routines[0].id,
                exercise_id=exercises[2].id,  # Dumbbell Curl
                sets=3,
                reps=12,
                weight=20.0,
                notes='Use moderate weight',
                order=2
            ),
            RoutineExercise(
                routine_id=routines[0].id,
                exercise_id=exercises[7].id,  # Overhead Press
                sets=3,
                reps=8,
                weight=45.0,
                notes='Start with just the bar if needed',
                order=3
            ),
            RoutineExercise(
                routine_id=routines[0].id,
                exercise_id=exercises[9].id,  # Tricep Dip
                sets=3,
                reps=10,
                weight=None,
                notes='Use bench for assistance if needed',
                order=4
            ),
            
            # Lower Body routine
            RoutineExercise(
                routine_id=routines[1].id,
                exercise_id=exercises[1].id,  # Squat
                sets=4,
                reps=8,
                weight=None,
                notes='Bodyweight only',
                order=1
            ),
            RoutineExercise(
                routine_id=routines[1].id,
                exercise_id=exercises[6].id,  # Leg Press
                sets=3,
                reps=12,
                weight=180.0,
                notes='Focus on full range of motion',
                order=2
            ),
            RoutineExercise(
                routine_id=routines[1].id,
                exercise_id=exercises[8].id,  # Plank
                sets=3,
                reps=1,
                weight=None,
                notes='Hold for 30-60 seconds',
                order=3
            ),
            
            # Full Body routine
            RoutineExercise(
                routine_id=routines[2].id,
                exercise_id=exercises[3].id,  # Bench Press
                sets=3,
                reps=8,
                weight=135.0,
                notes='Start light',
                order=1
            ),
            RoutineExercise(
                routine_id=routines[2].id,
                exercise_id=exercises[4].id,  # Deadlift
                sets=4,
                reps=6,
                weight=185.0,
                notes='Focus on form and bracing core',
                order=2
            ),
            RoutineExercise(
                routine_id=routines[2].id,
                exercise_id=exercises[5].id,  # Lat Pulldown
                sets=3,
                reps=10,
                weight=120.0,
                notes='Pull to upper chest',
                order=3
            ),
        ]
        db.session.add_all(routine_exercises)
        db.session.commit()
        
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()