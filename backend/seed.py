from app import app, db
from models import Exercise, Routine, Variation

def seed_database():
    """Seed the database with initial data"""
    with app.app_context():
        print("Seeding database...")
        
        # Clear existing data
        db.session.query(Variation).delete()
        db.session.query(Exercise).delete()
        db.session.query(Routine).delete()
        db.session.commit()
        
        print("Creating exercises...")
        # Create base exercises
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
        
        print("Creating variations...")
        # Create variations
        variations = []
        
        # Push-Up variations
        push_up_variations = [
            Variation(
                exercise_id=exercises[0].id,  # Push-Up
                name='Standard Push-Up',
                variation_type='Standard',
                routine_id=routines[0].id,  # Upper Body routine
            ),
            Variation(
                exercise_id=exercises[0].id,  # Push-Up
                name='Wide Push-Up',
                variation_type='Width Variation',
                routine_id=routines[0].id,  # Upper Body routine
            ),
            Variation(
                exercise_id=exercises[0].id,  # Push-Up
                name='Explosive Push-Up',
                variation_type='Power',
                routine_id=routines[2].id,  # Full Body routine
            ),
        ]
        variations.extend(push_up_variations)
        
        # Squat variations
        squat_variations = [
            Variation(
                exercise_id=exercises[1].id,  # Squat
                name='Bodyweight Squat',
                variation_type='Standard',
                routine_id=routines[1].id,  # Lower Body routine
            ),
            Variation(
                exercise_id=exercises[1].id,  # Squat
                name='Jump Squat',
                variation_type='Power',
                routine_id=routines[2].id,  # Full Body routine
            ),
        ]
        variations.extend(squat_variations)
        
        # Bench Press variations
        bench_variations = [
            Variation(
                exercise_id=exercises[3].id,  # Bench Press
                name='Flat Bench Press',
                variation_type='Standard',
                routine_id=routines[0].id,  # Upper Body routine
            ),
            Variation(
                exercise_id=exercises[3].id,  # Bench Press
                name='Incline Bench Press',
                variation_type='Angle Variation',
                routine_id=routines[0].id,  # Upper Body routine
            ),
        ]
        variations.extend(bench_variations)
        
        # Deadlift variations
        deadlift_variations = [
            Variation(
                exercise_id=exercises[4].id,  # Deadlift
                name='Conventional Deadlift',
                variation_type='Standard',
                routine_id=routines[1].id,  # Lower Body routine
            ),
        ]
        variations.extend(deadlift_variations)
        
        # Leg Press variations
        leg_press_variations = [
            Variation(
                exercise_id=exercises[6].id,  # Leg Press
                name='Standard Leg Press',
                variation_type='Standard',
                routine_id=routines[1].id,  # Lower Body routine
            ),
        ]
        variations.extend(leg_press_variations)
        
        # Plank variations
        plank_variations = [
            Variation(
                exercise_id=exercises[8].id,  # Plank
                name='Standard Plank',
                variation_type='Standard',
                routine_id=routines[2].id,  # Full Body routine
            ),
        ]
        variations.extend(plank_variations)
        
        db.session.add_all(variations)
        db.session.commit()
        
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()