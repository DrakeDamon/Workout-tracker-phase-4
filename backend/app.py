from flask import Flask, request, jsonify
from flask_restful import Api, Resource, reqparse
from flask_cors import CORS
from flask_migrate import Migrate
from config import Config
from models import db, Exercise, Routine, ExerciseVariation

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize database
db.init_app(app)

# Initialize migrations
migrate = Migrate(app, db)

# Initialize RESTful API
api = Api(app)

# Configure CORS
CORS(app, 
     resources={
         r"/api/*": {
             "origins": Config.CORS_ORIGINS,
             "methods": Config.CORS_METHODS,
             "allow_headers": Config.CORS_HEADERS,
             "supports_credentials": Config.CORS_SUPPORTS_CREDENTIALS
         }
     })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": str(error)}), 400

# Home route
@app.route('/')
def home():
    return jsonify({
        "message": "Welcome to the Workout Tracker API",
        "endpoints": {
            "GET /api/routines": "Get all routines",
            "GET /api/routines/:id": "Get a specific routine",
            "POST /api/routines": "Create a new routine",
            "PUT /api/routines/:id": "Update a routine",
            "DELETE /api/routines/:id": "Delete a routine",
            "GET /api/exercises": "Get all exercises",
            "GET /api/exercises/:id": "Get a specific exercise",
            "POST /api/exercises": "Create a new exercise",
            "GET /api/routines/:routine_id/exercises": "Get exercises for a specific routine",
            "POST /api/routines/:routine_id/exercises": "Add an exercise to a routine",
            "GET /api/routines/:routine_id/exercises/:exercise_id": "Get a specific exercise in a routine",
            "PUT /api/routines/:routine_id/exercises/:exercise_id": "Update an exercise in a routine",
            "DELETE /api/routines/:routine_id/exercises/:exercise_id": "Remove an exercise from a routine"
        }
    })

# Define API Resources

# Routine Resources
class RoutineListResource(Resource):
    def get(self):
        """Get all routines"""
        routines = Routine.query.all()
        return [routine.to_dict() for routine in routines], 200

    def post(self):
        """Create a new routine"""
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return {"error": "Routine name is required"}, 400
        
        try:
            routine = Routine(
                name=data['name'],
                day_of_week=data.get('day_of_week'),
                description=data.get('description')
            )
            
            db.session.add(routine)
            db.session.commit()
            
            return routine.to_dict(), 201
        except ValueError as e:
            return {"error": str(e)}, 400
        except Exception as e:
            db.session.rollback()
            return {"error": "An error occurred while creating the routine"}, 500

class RoutineResource(Resource):
    def get(self, routine_id):
        """Get a specific routine"""
        routine = Routine.query.get(routine_id)
        if not routine:
            return {"error": "Routine not found"}, 404
        
        return routine.to_dict(), 200

    def put(self, routine_id):
        """Update a specific routine"""
        routine = Routine.query.get(routine_id)
        if not routine:
            return {"error": "Routine not found"}, 404
        
        data = request.get_json()
        
        try:
            # Update fields if provided
            if 'name' in data:
                routine.name = data['name']
            if 'day_of_week' in data:
                routine.day_of_week = data['day_of_week']
            if 'description' in data:
                routine.description = data['description']
            
            db.session.commit()
            return routine.to_dict(), 200
        except ValueError as e:
            return {"error": str(e)}, 400
        except Exception as e:
            db.session.rollback()
            return {"error": "An error occurred while updating the routine"}, 500
    
    def delete(self, routine_id):
        """Delete a specific routine"""
        routine = Routine.query.get(routine_id)
        if not routine:
            return {"error": "Routine not found"}, 404
        
        try:
            db.session.delete(routine)
            db.session.commit()
            return {"message": "Routine deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": "An error occurred while deleting the routine"}, 500

# Exercise Resources
class ExerciseListResource(Resource):
    def get(self):
        """Get all exercises with optional filtering"""
        # Get query parameters
        parser = reqparse.RequestParser()
        parser.add_argument('muscle_group', type=str, location='args')
        parser.add_argument('equipment', type=str, location='args')
        parser.add_argument('search', type=str, location='args')
        args = parser.parse_args()
        
        # Start with base query
        query = Exercise.query
        
        # Apply filters if provided
        if args['muscle_group']:
            query = query.filter(Exercise.muscle_group == args['muscle_group'])
        if args['equipment']:
            query = query.filter(Exercise.equipment == args['equipment'])
        if args['search']:
            query = query.filter(Exercise.name.ilike(f'%{args["search"]}%'))
        
        # Execute query and return results
        exercises = query.all()
        return [exercise.to_dict() for exercise in exercises], 200

    def post(self):
        """Create a new exercise"""
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return {"error": "Exercise name is required"}, 400
        
        try:
            exercise = Exercise(
                name=data['name'],
                description=data.get('description'),
                muscle_group=data.get('muscle_group'),
                equipment=data.get('equipment')
            )
            
            db.session.add(exercise)
            db.session.commit()
            
            return exercise.to_dict(), 201
        except ValueError as e:
            return {"error": str(e)}, 400
        except Exception as e:
            db.session.rollback()
            return {"error": "An error occurred while creating the exercise"}, 500

class ExerciseResource(Resource):
    def get(self, exercise_id):
        """Get a specific exercise"""
        exercise = Exercise.query.get(exercise_id)
        if not exercise:
            return {"error": "Exercise not found"}, 404
        
        return exercise.to_dict(), 200

# Routine Exercise Resources (representing the Many-Through relationship)
class RoutineExerciseListResource(Resource):
    def get(self, routine_id):
        """Get all exercises for a specific routine"""
        routine = Routine.query.get(routine_id)
        if not routine:
            return {"error": "Routine not found"}, 404
        
        # Get all exercise variations for this routine
        variations = ExerciseVariation.query.filter_by(routine_id=routine_id).all()
        
        # Include the exercise details with each variation
        result = []
        for variation in variations:
            variation_dict = variation.to_dict()
            exercise = Exercise.query.get(variation.exercise_id)
            if exercise:
                variation_dict['exercise'] = exercise.to_dict()
            result.append(variation_dict)
            
        return result, 200

    def post(self, routine_id):
        """Add an exercise to a routine (with variation)"""
        routine = Routine.query.get(routine_id)
        if not routine:
            return {"error": "Routine not found"}, 404
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('exercise_id'):
            return {"error": "Exercise ID is required"}, 400
        
        # Check if exercise exists
        exercise = Exercise.query.get(data['exercise_id'])
        if not exercise:
            return {"error": "Exercise not found"}, 404
        
        # Check if this exercise is already in the routine
        existing = ExerciseVariation.query.filter_by(
            routine_id=routine_id, 
            exercise_id=data['exercise_id']
        ).first()
        
        if existing:
            return {"error": "This exercise is already in the routine"}, 400
        
        try:
            # Create variation for this exercise in this routine
            variation = ExerciseVariation(
                exercise_id=data['exercise_id'],
                name=data.get('name', f"{exercise.name} Variation"),
                description=data.get('description'),
                variation_type=data.get('variation_type', 'Standard'),
                routine_id=routine_id,
                sets=data.get('sets', 3),
                reps=data.get('reps', 10),
                weight=data.get('weight'),
                notes=data.get('notes'),
                order=data.get('order')
            )
            
            # If no order specified, put at the end
            if not variation.order:
                max_order = db.session.query(db.func.max(ExerciseVariation.order)).filter_by(routine_id=routine_id).scalar()
                variation.order = (max_order or 0) + 1
            
            db.session.add(variation)
            db.session.commit()
            
            # Return the variation with the exercise details
            result = variation.to_dict()
            result['exercise'] = exercise.to_dict()
            
            return result, 201
        except ValueError as e:
            return {"error": str(e)}, 400
        except Exception as e:
            db.session.rollback()
            return {"error": "An error occurred while adding the exercise to the routine"}, 500

class RoutineExerciseResource(Resource):
    def get(self, routine_id, exercise_id):
        """Get a specific exercise in a routine"""
        # Find the variation that connects this exercise to this routine
        variation = ExerciseVariation.query.filter_by(
            routine_id=routine_id, 
            exercise_id=exercise_id
        ).first()
        
        if not variation:
            return {"error": "Exercise not found in this routine"}, 404
        
        # Get the exercise details
        exercise = Exercise.query.get(exercise_id)
        
        # Return the variation with the exercise details
        result = variation.to_dict()
        result['exercise'] = exercise.to_dict()
        
        return result, 200

    def put(self, routine_id, exercise_id):
        """Update an exercise in a routine"""
        # Find the variation that connects this exercise to this routine
        variation = ExerciseVariation.query.filter_by(
            routine_id=routine_id, 
            exercise_id=exercise_id
        ).first()
        
        if not variation:
            return {"error": "Exercise not found in this routine"}, 404
        
        data = request.get_json()
        
        try:
            # Update variation details
            if 'name' in data:
                variation.name = data['name']
            if 'description' in data:
                variation.description = data['description']
            if 'variation_type' in data:
                variation.variation_type = data['variation_type']
            if 'sets' in data:
                variation.sets = data['sets']
            if 'reps' in data:
                variation.reps = data['reps']
            if 'weight' in data:
                variation.weight = data['weight']
            if 'notes' in data:
                variation.notes = data['notes']
            if 'order' in data:
                variation.order = data['order']
            
            db.session.commit()
            
            # Get the exercise details
            exercise = Exercise.query.get(exercise_id)
            
            # Return the updated variation with exercise details
            result = variation.to_dict()
            result['exercise'] = exercise.to_dict()
            
            return result, 200
        except ValueError as e:
            return {"error": str(e)}, 400
        except Exception as e:
            db.session.rollback()
            return {"error": "An error occurred while updating the exercise"}, 500

    def delete(self, routine_id, exercise_id):
        """Remove an exercise from a routine"""
        # Find the variation that connects this exercise to this routine
        variation = ExerciseVariation.query.filter_by(
            routine_id=routine_id, 
            exercise_id=exercise_id
        ).first()
        
        if not variation:
            return {"error": "Exercise not found in this routine"}, 404
        
        try:
            db.session.delete(variation)
            db.session.commit()
            return {"message": "Exercise removed from routine successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": "An error occurred while removing the exercise from the routine"}, 500

# Register API routes
api.add_resource(RoutineListResource, '/api/routines')
api.add_resource(RoutineResource, '/api/routines/<int:routine_id>')
api.add_resource(ExerciseListResource, '/api/exercises')
api.add_resource(ExerciseResource, '/api/exercises/<int:exercise_id>')
api.add_resource(RoutineExerciseListResource, '/api/routines/<int:routine_id>/exercises')
api.add_resource(RoutineExerciseResource, '/api/routines/<int:routine_id>/exercises/<int:exercise_id>')

# For running the app directly
if __name__ == '__main__':
    app.run(debug=True, port=5555)