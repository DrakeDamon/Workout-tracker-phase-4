from flask import Flask, request, jsonify
from flask_restful import Api, Resource, reqparse
from flask_cors import CORS
from flask_migrate import Migrate
from config import Config
from models import db, Exercise, Routine, Variation

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
            # Routine endpoints
            "GET /api/routines": "Get all routines",
            "GET /api/routines/:id": "Get a specific routine",
            "POST /api/routines": "Create a new routine",
            "PUT /api/routines/:id": "Update a routine",
            "DELETE /api/routines/:id": "Delete a routine",
            
            # Exercise endpoints
            "GET /api/exercises": "Get all exercises",
            "GET /api/exercises/:id": "Get a specific exercise",
            "POST /api/exercises": "Create a new exercise",
            
            # Variation endpoints (join table between routines and exercises)
            "GET /api/routines/:routine_id/variations": "Get all variations for a routine",
            "POST /api/routines/:routine_id/variations": "Add a variation to a routine",
            "GET /api/routines/:routine_id/variations/:variation_id": "Get a specific variation",
            "PUT /api/routines/:routine_id/variations/:variation_id": "Update a variation",
            "DELETE /api/routines/:routine_id/variations/:variation_id": "Delete a variation",
            
            # Variation Types
            "GET /api/variation-types": "Get all unique variation types",
            "POST /api/variation-types": "Create a new variation type"
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
        """Get a specific routine with all its variations"""
        routine = Routine.query.get(routine_id)
        if not routine:
            return {"error": "Routine not found"}, 404
        
        # Get the routine with its variations and related exercises
        routine_dict = routine.to_dict()
        
        # Get all variations for this routine
        variations = Variation.query.filter_by(routine_id=routine_id).all()
        variations_with_exercises = []
        
        for variation in variations:
            var_dict = variation.to_dict()
            # Get the associated exercise
            exercise = Exercise.query.get(variation.exercise_id)
            if exercise:
                var_dict['exercise'] = exercise.to_dict()
            variations_with_exercises.append(var_dict)
        
        routine_dict['variations'] = variations_with_exercises
        
        return routine_dict, 200

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

# Variation Resources (join table between routines and exercises)
class VariationListResource(Resource):
    def get(self, routine_id):
        """Get all variations for a specific routine"""
        routine = Routine.query.get(routine_id)
        if not routine:
            return {"error": "Routine not found"}, 404
        
        # Get all variations for this routine
        variations = Variation.query.filter_by(routine_id=routine_id).all()
        
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
        """Add a variation to a routine"""
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
        
        try:
            # Create variation
            variation = Variation(
                exercise_id=data['exercise_id'],
                routine_id=routine_id,
                name=data.get('name', f"{exercise.name} Variation"),
                variation_type=data.get('variation_type', 'Standard')
            )
            
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
            return {"error": "An error occurred while adding the variation"}, 500

class VariationResource(Resource):
    def get(self, routine_id, variation_id):
        """Get a specific variation"""
        variation = Variation.query.get(variation_id)
        
        if not variation or variation.routine_id != routine_id:
            return {"error": "Variation not found in this routine"}, 404
        
        # Get the exercise details
        exercise = Exercise.query.get(variation.exercise_id)
        
        # Return the variation with the exercise details
        result = variation.to_dict()
        result['exercise'] = exercise.to_dict()
        
        return result, 200

    def put(self, routine_id, variation_id):
        """Update a variation"""
        variation = Variation.query.get(variation_id)
        
        if not variation or variation.routine_id != routine_id:
            return {"error": "Variation not found in this routine"}, 404
        
        data = request.get_json()
        
        try:
            # Update variation details
            if 'name' in data:
                variation.name = data['name']
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
            
            db.session.commit()
            
            # Get the exercise details
            exercise = Exercise.query.get(variation.exercise_id)
            
            # Return the updated variation with exercise details
            result = variation.to_dict()
            result['exercise'] = exercise.to_dict()
            
            return result, 200
        except ValueError as e:
            return {"error": str(e)}, 400
        except Exception as e:
            db.session.rollback()
            return {"error": "An error occurred while updating the variation"}, 500

    def delete(self, routine_id, variation_id):
        """Delete a variation"""
        variation = Variation.query.get(variation_id)
        
        if not variation or variation.routine_id != routine_id:
            return {"error": "Variation not found in this routine"}, 404
        
        try:
            db.session.delete(variation)
            db.session.commit()
            return {"message": "Variation deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": "An error occurred while deleting the variation"}, 500



class RoutineExercisesResource(Resource):
    def get(self, routine_id):
        """Get all exercises for a specific routine through variations"""
        routine = Routine.query.get(routine_id)
        if not routine:
            return {"error": "Routine not found"}, 404
        
        # Get all variations for this routine
        variations = Variation.query.filter_by(routine_id=routine_id).all()
        
        # Get the exercises through the variations
        exercises = []
        for variation in variations:
            exercise = Exercise.query.get(variation.exercise_id)
            if exercise:
                exercise_data = exercise.to_dict()
                # Add variation data
                exercise_data['variation'] = variation.to_dict()
                exercises.append(exercise_data)
        
        return exercises, 200

# VariationTypes Resource - gets unique variation types from existing variations
class VariationTypesResource(Resource):
    def get(self):
        """Get all unique variation types"""
        # Query distinct variation types from the Variation table
        variation_types = db.session.query(Variation.variation_type).distinct().all()
        
        # Convert to a list of strings and filter out None values
        types = [t[0] for t in variation_types if t[0]]
        
        # Define default types to ensure these always exist
        default_types = [
            'Standard',
            'Width Variation',
            'Angle Variation',
            'Grip Variation',
            'Tempo Variation',
            'Power',
            'Endurance',
            'Other'
        ]
        
        # Add any default types that are not already in the list
        for default_type in default_types:
            if default_type not in types:
                types.append(default_type)
        
        # Return as a list of objects for consistency with other endpoints
        result = [{"id": i+1, "name": t, "description": "", "is_default": t in default_types} for i, t in enumerate(sorted(types))]
        return result, 200

    def post(self):
        """Create a new variation type by adding a reference to it in the database"""
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name'):
            return {"error": "Variation type name is required"}, 400
            
        # Check if variation type already exists
        variation_types = db.session.query(Variation.variation_type).distinct().all()
        existing_types = [t[0] for t in variation_types if t[0]]
        
        if data['name'] in existing_types:
            return {"error": f"Variation type '{data['name']}' already exists"}, 400
            
        # Find a routine and exercise to use for the reference variation
        routine = Routine.query.first()
        exercise = Exercise.query.first()
        
        if not routine or not exercise:
            return {"error": "Cannot create variation type: no routines or exercises exist"}, 400
            
        # Create a variation with the new type to ensure it exists in the database
        reference_variation = Variation(
            exercise_id=exercise.id,
            routine_id=routine.id,
            name=f"Reference for type: {data['name']}",
            variation_type=data['name']
        )
        
        try:
            db.session.add(reference_variation)
            db.session.commit()
            
            return {
                "id": len(existing_types) + 1,
                "name": data['name'],
                "description": data.get('description', ''),
                "is_default": False
            }, 201
        except Exception as e:
            db.session.rollback()
            return {"error": f"Failed to create variation type: {str(e)}"}, 500

# Register API routes
api.add_resource(RoutineListResource, '/api/routines')
api.add_resource(RoutineResource, '/api/routines/<int:routine_id>')
api.add_resource(ExerciseListResource, '/api/exercises')
api.add_resource(ExerciseResource, '/api/exercises/<int:exercise_id>')
api.add_resource(VariationListResource, '/api/routines/<int:routine_id>/variations')
api.add_resource(VariationResource, '/api/routines/<int:routine_id>/variations/<int:variation_id>')
api.add_resource(VariationTypesResource, '/api/variation-types')
api.add_resource(RoutineExercisesResource, '/api/routines/<int:routine_id>/exercises')
# For running the app directly
if __name__ == '__main__':
    app.run(debug=True, port=5555)