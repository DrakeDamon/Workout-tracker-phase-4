from app import app, db
from models import Exercise, Routine, ExerciseVariation

def seed_database():
    """Seed the database with initial data"""
    with app.app_context():
        print("Seeding database...")
        
        # Clear existing data
        db.session.query(ExerciseVariation).delete()
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
        
        print("Creating exercise variations...")
        # Create exercise variations
        variations = []
        
        # Push-Up variations
        push_up_variations = [
            ExerciseVariation(
                exercise_id=exercises[0].id,  # Push-Up
                name='Standard Push-Up',
                description='Regular push-up with hands shoulder-width apart',
                variation_type='Standard',
                routine_id=routines[0].id,  # Upper Body routine
                sets=3,
                reps=10,
                notes='Focus on form',
                order=1
            ),
            ExerciseVariation(
                exercise_id=exercises[0].id,  # Push-Up
                name='Wide Push-Up',
                description='Push-up with hands wider than shoulder width',
                variation_type='Width Variation',
                routine_id=routines[0].id,  # Upper Body routine
                sets=3,
                reps=12,
                notes='Focus on chest engagement',
                order=2
            ),
            ExerciseVariation(
                exercise_id=exercises[0].id,  # Push-Up
                name='Explosive Push-Up',
                description='Push-up with explosive movement to lift hands off ground',
                variation_type='Power',
                routine_id=routines[2].id,  # Full Body routine
                sets=3,
                reps=8,
                notes='Focus on explosive power',
                order=1
            ),
        ]
        variations.extend(push_up_variations)
        
        # Squat variations
        squat_variations = [
            ExerciseVariation(
                exercise_id=exercises[1].id,  # Squat
                name='Bodyweight Squat',
                description='Standard squat using only bodyweight',
                variation_type='Standard',
                routine_id=routines[1].id,  # Lower Body routine
                sets=4,
                reps=15,
                notes='Focus on depth and form',
                order=1
            ),
            ExerciseVariation(
                exercise_id=exercises[1].id,  # Squat
                name='Jump Squat',
                description='Explosive squat with a jump at the top',
                variation_type='Power',
                routine_id=routines[2].id,  # Full Body routine
                sets=3,
                reps=10,
                notes='Land softly and with control',
                order=2
            ),
        ]
        variations.extend(squat_variations)
        
        # Bench Press variations
        bench_variations = [
            ExerciseVariation(
                exercise_id=exercises[3].id,  # Bench Press
                name='Flat Bench Press',
                description='Standard bench press on flat bench',
                variation_type='Standard',
                routine_id=routines[0].id,  # Upper Body routine
                sets=3,
                reps=8,
                weight=135.0,
                notes='Start with light weight',
                order=3
            ),
            ExerciseVariation(
                exercise_id=exercises[3].id,  # Bench Press
                name='Incline Bench Press',
                description='Bench press on an inclined bench',
                variation_type='Angle Variation',
                routine_id=routines[0].id,  # Upper Body routine
                sets=3,
                reps=10,
                weight=115.0,
                notes='Focus on upper chest',
                order=4
            ),
        ]
        variations.extend(bench_variations)
        
        # Deadlift variations
        deadlift_variations = [
            ExerciseVariation(
                exercise_id=exercises[4].id,  # Deadlift
                name='Conventional Deadlift',
                description='Standard deadlift with feet hip-width apart',
                variation_type='Standard',
                routine_id=routines[1].id,  # Lower Body routine
                sets=3,
                reps=5,
                weight=185.0,
                notes='Focus on form and bracing core',
                order=2
            ),
        ]
        variations.extend(deadlift_variations)
        
        # Leg Press variations
        leg_press_variations = [
            ExerciseVariation(
                exercise_id=exercises[6].id,  # Leg Press
                name='Standard Leg Press',
                description='Traditional leg press with feet shoulder-width apart',
                variation_type='Standard',
                routine_id=routines[1].id,  # Lower Body routine
                sets=3,
                reps=12,
                weight=180.0,
                notes='Focus on full range of motion',
                order=3
            ),
        ]
        variations.extend(leg_press_variations)
        
        # Plank variations
        plank_variations = [
            ExerciseVariation(
                exercise_id=exercises[8].id,  # Plank
                name='Standard Plank',
                description='Traditional plank position on forearms',
                variation_type='Standard',
                routine_id=routines[2].id,  # Full Body routine
                sets=3,
                reps=1,
                notes='Hold for 30-60 seconds',
                order=3
            ),
        ]
        variations.extend(plank_variations)
        
        db.session.add_all(variations)
        db.session.commit()
        
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()