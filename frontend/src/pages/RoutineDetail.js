import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Navbar from '../components/Layout/Navbar';
import '../styles/RoutineDetail.css';

const RoutineDetail = () => {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const { 
    loadRoutineDetails, 
    currentRoutine, 
    updateRoutine,
    updateRoutineExercise,
    isLoading, 
    errors 
  } = useAppContext();
  
  // Form state for routine
  const [routineFormData, setRoutineFormData] = useState({
    name: '',
    day_of_week: '',
    description: ''
  });
  
  // Form state for exercises
  const [exerciseFormData, setExerciseFormData] = useState([]);
  
  // Day of week options
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
    'Friday', 'Saturday', 'Sunday'
  ];
  
  // Load routine details on component mount
  useEffect(() => {
    const fetchRoutine = async () => {
      const routine = await loadRoutineDetails(routineId);
      if (routine) {
        setRoutineFormData({
          name: routine.name || '',
          day_of_week: routine.day_of_week || '',
          description: routine.description || ''
        });
        
        // Initialize exercise form data
        if (routine.routine_exercises) {
          const exerciseData = routine.routine_exercises.map(re => ({
            id: re.id,
            sets: re.sets || '',
            reps: re.reps || '',
            weight: re.weight || '',
            notes: re.notes || ''
          }));
          setExerciseFormData(exerciseData);
        }
      }
    };
    
    fetchRoutine();
  }, [routineId, loadRoutineDetails]);
  
  // Handle routine input changes
  const handleRoutineChange = (e) => {
    const { name, value } = e.target;
    setRoutineFormData({
      ...routineFormData,
      [name]: value
    });
  };
  
  // Handle exercise input changes
  const handleExerciseChange = (index, field, value) => {
    const updatedExercises = [...exerciseFormData];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    };
    setExerciseFormData(updatedExercises);
  };
  
  // Handle routine form submission
const handleRoutineSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // Update the routine first
    const updatedRoutine = await updateRoutine(routineId, routineFormData);
    
    // Update exercises one by one
    for (const exercise of exerciseFormData) {
      // Create a clean data object with only the fields your API expects
      const exerciseData = {
        sets: parseInt(exercise.sets) || 0,
        reps: parseInt(exercise.reps) || 0,
        weight: exercise.weight ? parseFloat(exercise.weight) : null,
        notes: exercise.notes || ''
      };
      
      await updateRoutineExercise(exercise.id, exerciseData);
    }
    
    // Use proper navigation after all updates complete
    alert('Routine updated successfully!');
    navigate('/');
  } catch (error) {
    console.error('Error updating routine:', error);
    alert('Failed to update routine. Please try again.');
  }
};
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/'); // Navigate to dashboard without updating
  };
  
  if (isLoading.routine) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="routine-detail-container loading">
          Loading routine details...
        </div>
      </div>
    );
  }
  
  if (errors.routine) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="routine-detail-container error">
          <div className="alert alert-danger">
            {errors.routine}
          </div>
          <Link to="/" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  if (!currentRoutine) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="routine-detail-container error">
          <h2>Routine Not Found</h2>
          <p>The routine you're looking for doesn't exist or was deleted.</p>
          <Link to="/" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="app-container">
      <Navbar />
      
      <div className="routine-detail-container">
        <div className="routine-form">
          <h1>Routine Details</h1>
          <form onSubmit={handleRoutineSubmit}>
            <div className="form-group">
              <label htmlFor="name">Routine Name*</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={routineFormData.name}
                onChange={handleRoutineChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="day_of_week">Day of Week</label>
              <select
                id="day_of_week"
                name="day_of_week"
                className="form-control"
                value={routineFormData.day_of_week}
                onChange={handleRoutineChange}
              >
                <option value="">Select a day</option>
                {daysOfWeek.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                value={routineFormData.description}
                onChange={handleRoutineChange}
                rows="4"
              ></textarea>
            </div>
            
            <h2>Exercises</h2>
            
            {currentRoutine.routine_exercises && currentRoutine.routine_exercises.length > 0 ? (
              <div className="exercise-list">
                {currentRoutine.routine_exercises.map((routineExercise, index) => (
                  <div key={routineExercise.id} className="exercise-card">
                    <h3 className="exercise-name">{routineExercise.exercise.name}</h3>
                    
                    <div className="exercise-details">
                      <div className="form-group">
                        <label>Sets</label>
                        <input
                          type="number"
                          className="form-control"
                          value={exerciseFormData[index]?.sets || ''}
                          onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                          min="1"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Reps</label>
                        <input
                          type="number"
                          className="form-control"
                          value={exerciseFormData[index]?.reps || ''}
                          onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                          min="1"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Weight (lbs)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={exerciseFormData[index]?.weight || ''}
                          onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                          min="0"
                          step="0.5"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Notes</label>
                        <textarea
                          className="form-control"
                          value={exerciseFormData[index]?.notes || ''}
                          onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                          rows="2"
                        ></textarea>
                      </div>
                    </div>
                    
                    {routineExercise.exercise.muscle_group && (
                      <div className="exercise-muscle">
                        Muscle Group: {routineExercise.exercise.muscle_group}
                      </div>
                    )}
                    
                    {routineExercise.exercise.equipment && (
                      <div className="exercise-equipment">
                        Equipment: {routineExercise.exercise.equipment}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-exercises">
                <p>No exercises added to this routine yet.</p>
              </div>
            )}
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading.update}
              >
                {isLoading.update ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoutineDetail;