from flask import Flask, request, session, jsonify
from flask_restful import Api, Resource, reqparse
from flask_cors import CORS
from flask_migrate import Migrate
from werkzeug.exceptions import NotFound, BadRequest
import os
from config import Config
from models import db, Exercise, Routine, RoutineExercise

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

             "origins": ["http://localhost:3000"],
             "methods": ["OPTIONS", "GET", "POST", "PUT", "DELETE"],
             "allow_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True

         }

     })

# Ensure you handle OPTIONS explicitly

@app.route('/api/login', methods=['OPTIONS'])

def options_handler():

    return '', 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": str(error)}), 400

@app.route('/api/register', methods=['OPTIONS'])

def register_options_handler():

    return '', 200



# Login Resource

class LoginResource(Resource):

    def post(self):

        data = request.get_json()

        username = data.get('username')

        password = data.get('password')

        # Simplified authentication using config

        if (username == app.config['DEFAULT_USERNAME'] and 

            password == app.config['DEFAULT_PASSWORD']):

            # Set session user

            session['user_id'] = 1  # Hardcoded user ID

            return {'id': 1, 'username': username}, 200

        

        return {'error': 'Invalid credentials'}, 401

# Check Session Resource

class CheckSessionResource(Resource):

    def get(self):

        # Check if user is in session

        if session.get('user_id'):

            return {'id': session['user_id'], 'username': app.config['DEFAULT_USERNAME']}, 200

        return {'message': '401: Not Authorized'}, 401

# Logout Resource

class LogoutResource(Resource):

    def delete(self):

        # Remove user from session

        session.pop('user_id', None)

        return {'message': 'Logged out successfully'}, 204
# Registration Resource
class RegisterResource(Resource):
    def post(self):
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        # Validate required fields
        if not username or not password:
            return {"error": "Username and password are required"}, 400
        
        # Update the default username and password
        app.config['DEFAULT_USERNAME'] = username
        app.config['DEFAULT_PASSWORD'] = password
        
        return {"message": "Registration successful"}, 201
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
            "POST /api/routines/:id/exercises": "Add an exercise to a routine",
            "PUT /api/routine-exercises/:id": "Update a routine exercise",
            "DELETE /api/routine-exercises/:id": "Remove an exercise from a routine"
        }
    })

# Define API Resources
#Get Routine list
class RoutineListResource(Resource):
    def get(self):
        """Get all routines"""
        routines = Routine.query.all()
        return [routine.to_dict() for routine in routines], 200

#Create Routine  
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

#Get speficic routines
class RoutineResource(Resource):
    def get(self, routine_id):
        """Get a specific routine"""
        routine = Routine.query.get(routine_id)
        if not routine:
            return {"error": "Routine not found"}, 404
        
        return routine.to_dict(), 200

#Update routines
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


#Delete routines       
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


#Get Exercise list
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

#Create new exercise
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


#Get specific exercise
class ExerciseResource(Resource):
    def get(self, exercise_id):
        """Get a specific exercise"""
        exercise = Exercise.query.get(exercise_id)
        if not exercise:
            return {"error": "Exercise not found"}, 404
        
        return exercise.to_dict(), 200


class RoutineExerciseResource(Resource):
    def post(self, routine_id):
        """Add an exercise to a routine"""
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
            # Get the next order position
            max_order = db.session.query(db.func.max(RoutineExercise.order)).filter_by(routine_id=routine_id).scalar()
            next_order = (max_order or 0) + 1
            
            # Create routine exercise relationship
            routine_exercise = RoutineExercise(
                routine_id=routine_id,
                exercise_id=data['exercise_id'],
                sets=data.get('sets', 3),
                reps=data.get('reps', 10),
                weight=data.get('weight'),
                notes=data.get('notes'),
                order=next_order
            )
            
            db.session.add(routine_exercise)
            db.session.commit()
            
            return routine_exercise.to_dict(), 201
        except ValueError as e:
            return {"error": str(e)}, 400
        except Exception as e:
            db.session.rollback()
            return {"error": "An error occurred while adding the exercise to the routine"}, 500

class RoutineExerciseDetailResource(Resource):
    def put(self, routine_exercise_id):
        """Update a routine exercise"""
        routine_exercise = RoutineExercise.query.get(routine_exercise_id)
        if not routine_exercise:
            return {"error": "Routine exercise not found"}, 404
        
        data = request.get_json()
        
        try:
            # Update fields if provided
            if 'sets' in data:
                routine_exercise.sets = data['sets']
            if 'reps' in data:
                routine_exercise.reps = data['reps']
            if 'weight' in data:
                routine_exercise.weight = data['weight']
            if 'notes' in data:
                routine_exercise.notes = data['notes']
            if 'order' in data:
                routine_exercise.order = data['order']
            
            db.session.commit()
            return routine_exercise.to_dict(), 200
        except ValueError as e:
            return {"error": str(e)}, 400
        except Exception as e:
            db.session.rollback()
            return {"error": "An error occurred while updating the routine exercise"}, 500
    
    def delete(self, routine_exercise_id):
        """Remove an exercise from a routine"""
        routine_exercise = RoutineExercise.query.get(routine_exercise_id)
        if not routine_exercise:
            return {"error": "Routine exercise not found"}, 404
        
        try:
            db.session.delete(routine_exercise)
            db.session.commit()
            return {"message": "Exercise removed from routine successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": "An error occurred while removing the exercise from the routine"}, 500

class UserDataResource(Resource):
    def get(self):
        """Get all data in a single request (routines, exercises, and metadata)"""
        try:
            # Get all routines with their exercises
            routines = Routine.query.all()
            
            # Get all exercises
            exercises = Exercise.query.all()
            
            # Get unique muscle groups and equipment types
            muscle_groups = db.session.query(Exercise.muscle_group).distinct().all()
            equipment_list = db.session.query(Exercise.equipment).distinct().all()
            
            return {
                'routines': [routine.to_dict() for routine in routines],
                'exercises': [exercise.to_dict() for exercise in exercises],
                'muscle_groups': [mg[0] for mg in muscle_groups if mg[0]],
                'equipment': [eq[0] for eq in equipment_list if eq[0]]
            }, 200
        except Exception as e:
            return {"error": f"An error occurred while fetching user data: {str(e)}"}, 500

# Register API routes
api.add_resource(RoutineListResource, '/api/routines')
api.add_resource(RoutineResource, '/api/routines/<int:routine_id>')
api.add_resource(ExerciseListResource, '/api/exercises')
api.add_resource(ExerciseResource, '/api/exercises/<int:exercise_id>')
api.add_resource(RoutineExerciseResource, '/api/routines/<int:routine_id>/exercises')
api.add_resource(RoutineExerciseDetailResource, '/api/routine-exercises/<int:routine_exercise_id>')
api.add_resource(UserDataResource, '/api/user-data')
api.add_resource(LoginResource, '/api/login')
api.add_resource(CheckSessionResource, '/api/check_session')
api.add_resource(LogoutResource, '/api/logout')
api.add_resource(RegisterResource, '/api/register')
# For running the app directly
if __name__ == '__main__':
    app.run(debug=True, port=5555)