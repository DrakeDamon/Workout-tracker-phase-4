# Workout Tracker

A full-stack web application for creating and managing workout routines. This application allows users to create custom workout routines, add exercises from a library, and track their fitness journey.

## Features

- User authentication (login/logout)
- Create, view, update, and delete workout routines
- Browse and filter exercises by muscle groups and equipment
- Add exercises to routines with customizable sets, reps, and weight
- Create new exercises to expand the exercise library
- Responsive UI for desktop and mobile use

## Tech Stack

### Frontend

- React
- React Router
- Context API for state management
- Fetch API for backend communication
- CSS for styling

### Backend

- Flask (Python)
- SQLAlchemy ORM
- SQLite database (can be configured for PostgreSQL/MySQL)
- Flask-Login for authentication
- Flask-CORS for cross-origin requests

## Project Structure

```
workout-tracker/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── models.py           # Database models
│   ├── requirements.txt    # Python dependencies
│   └── seed.py             # Database seeding script
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context for state management
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   └── styles/         # CSS files
│   ├── package.json        # NPM dependencies
│   └── README.md           # React app documentation
└── README.md               # Project documentation
```

## Data Models

### User

- id (Primary Key)
- username (Unique)
- password_hash

### Routine

- id (Primary Key)
- name
- day_of_week
- description
- created_at
- updated_at
- user_id (Foreign Key to User)

### Exercise

- id (Primary Key)
- name
- description
- muscle_group
- equipment

### RoutineExercise (Join Table)

- id (Primary Key)
- routine_id (Foreign Key to Routine)
- exercise_id (Foreign Key to Exercise)
- sets
- reps
- weight
- notes
- order

## API Endpoints

### Authentication

- `POST /api/login` - Login with username/password
- `POST /api/logout` - Logout current user
- `GET /api/check-auth` - Check if user is authenticated

### User Data

- `GET /api/user-data` - Get user's routines, exercises, muscle groups, equipment

### Routines

- `GET /api/routines/<routine_id>` - Get a specific routine
- `POST /api/routines` - Create a new routine
- `PUT /api/routines/<routine_id>` - Update a routine
- `DELETE /api/routines/<routine_id>` - Delete a routine

### Exercises

- `GET /api/exercises` - Get all exercises (with optional filters)
- `GET /api/exercises/<exercise_id>` - Get a specific exercise
- `POST /api/exercises` - Create a new exercise

### Routine Exercises

- `POST /api/routines/<routine_id>/exercises` - Add exercise to routine
- `PUT /api/routine-exercises/<routine_exercise_id>` - Update routine exercise
- `DELETE /api/routine-exercises/<routine_exercise_id>` - Remove exercise from routine

### Utility

- `GET /api/muscle-groups` - Get all muscle groups
- `GET /api/equipment` - Get all equipment types

## Setup and Installation

### Prerequisites

- Python 3.9+
- Node.js 14+
- npm or yarn

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/workout-tracker.git
cd workout-tracker

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Set up the database
python seed.py

# Start the Flask server
python app.py
```

### Frontend Setup

```bash
# In a new terminal, navigate to the frontend directory
cd workout-tracker/frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The application will be available at http://localhost:3000, with the API running at http://localhost:5555.

## Usage

### First-time Setup

1. Launch the application
2. Log in with the default user:
   - Username: `testuser`
   - Password: `testpassword`
3. Browse existing routines or create your own

### Creating a Routine

1. Click "Create New Routine" on the dashboard
2. Fill in routine details (name, day of week, description)
3. Add exercises to your routine with specific sets, reps, and weight
4. Save your routine

### Adding a Custom Exercise

1. Navigate to the Exercise Browser
2. Click "Create New Exercise"
3. Fill in exercise details (name, muscle group, equipment, description)
4. Save your new exercise to add it to the library

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Designed and developed as a learning project
- Inspired by various fitness tracking applications
