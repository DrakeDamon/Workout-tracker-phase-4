import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Navbar from '../components/Layout/Navbar';
import '../styles/RoutineDetail.css';

const RoutineDetail = () => {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const { 
    getRoutineById, 
    currentRoutine, 
    updateRoutine,
    updateVariation, // Added this
    removeExerciseFromRoutine,
    addExerciseToRoutine,
    exercises,
    isLoading, 
    errors 
  } = useAppContext();
  
  // Form state for routine
  const [routineFormData, setRoutineFormData] = useState({
    name: '',
    day_of_week: '',
    description: ''
  });
  
  // Form state for routine exercises
  const [exerciseFormData, setExerciseFormData] = useState([]);
  
  // State to store available variations for each exercise
  const [exerciseVariations, setExerciseVariations] = useState({});
  
  // Add exercise state
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseData, setNewExerciseData] = useState({
    exercise_id: '',
    name: '',
    variation_type: 'Standard',
    sets: 3,
    reps: 10,
    weight: '',
    notes: ''
  });
  
  // Day of week options
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
    'Friday', 'Saturday', 'Sunday'
  ];
  
  // Variation types
  const variationTypes = [
    'Standard',
    'Width Variation',
    'Angle Variation',
    'Grip Variation',
    'Tempo Variation',
    'Power',
    'Endurance',
    'Other'
  ];
  
  // Debug log state changes
  useEffect(() => {
    console.log('RoutineDetail - Current Routine:', currentRoutine);
  }, [currentRoutine]);
  
  // Load routine details on component mount
  useEffect(() => {
    console.log('RoutineDetail component mounted with routineId:', routineId);
    
    // Get the routine with all its data in a single call
    const routine = getRoutineById(routineId);
    console.log('Routine returned from getRoutineById:', routine);
    
    if (routine) {
      // Update form data with routine details
      setRoutineFormData({
        name: routine.name || '',
        day_of_week: routine.day_of_week || '',
        description: routine.description || ''
      });
    }
  }, [routineId, getRoutineById]);
  
  // Update form data when the current routine changes
  useEffect(() => {
    if (currentRoutine) {
      // Get the exercises/variations from the routine
      const exerciseList = currentRoutine.exercises || currentRoutine.variations || [];
      console.log('Updating exercise form data with routine exercises:', exerciseList);
      
      if (exerciseList.length > 0) {
        const exerciseData = exerciseList.map(re => ({
          exercise_id: re.exercise_id,
          variation_id: re.id,
          name: re.name,
          variation_type: re.variation_type || 'Standard',
          sets: re.sets || '',
          reps: re.reps || '',
          weight: re.weight || '',
          notes: re.notes || ''
        }));
        
        setExerciseFormData(exerciseData);
        
        // Gather available variations for each exercise
        const variations = {};
        exerciseList.forEach(re => {
          if (!variations[re.exercise_id]) {
            const sameExerciseVariations = exercises
              .filter(ex => ex.id === re.exercise_id)
              .map(ex => ({
                id: ex.id,
                name: ex.name,
                variation_type: 'Standard'
              }));
              
            variations[re.exercise_id] = sameExerciseVariations;
          }
        });
        
        setExerciseVariations(variations);
      }
    }
  }, [currentRoutine, exercises]);
  
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
    console.log(`Changing exercise ${index}, field: ${field}, value: ${value}`);
    
    const updatedExercises = [...exerciseFormData];
    updatedExercises[index] = {
      ...updatedExercises[index],
      [field]: value
    };
    
    setExerciseFormData(updatedExercises);
  };
  
  // Handle variation change
  const handleVariationChange = (index, variationType) => {
    console.log(`Changing variation for exercise at index ${index} to ${variationType}`);
    
    const updatedExercises = [...exerciseFormData];
    const exercise = updatedExercises[index];
    
    // Update name to include the new variation type
    const baseExerciseName = exercise.name.split('(')[0].trim();
    const newName = `${baseExerciseName} (${variationType})`;
    
    updatedExercises[index] = {
      ...exercise,
      name: newName,
      variation_type: variationType
    };
    
    setExerciseFormData(updatedExercises);
  };
  
  // Handle new exercise input changes
  const handleNewExerciseChange = (field, value) => {
    console.log(`Changing new exercise field: ${field}, value: ${value}`);
    
    setNewExerciseData({
      ...newExerciseData,
      [field]: value
    });
    
    if (field === 'exercise_id' && value) {
      const selectedExercise = exercises.find(ex => ex.id === parseInt(value, 10));
      if (selectedExercise) {
        console.log('Selected exercise:', selectedExercise);
        
        const variationType = newExerciseData.variation_type || 'Standard';
        const newName = `${selectedExercise.name} (${variationType})`;
        
        setNewExerciseData(prev => ({
          ...prev,
          name: newName,
          exercise_id: parseInt(value, 10)
        }));
      }
    }
    
    if (field === 'variation_type' && value && newExerciseData.exercise_id) {
      const selectedExercise = exercises.find(ex => ex.id === newExerciseData.exercise_id);
      if (selectedExercise) {
        const baseExerciseName = selectedExercise.name;
        const newName = `${baseExerciseName} (${value})`;
        
        setNewExerciseData(prev => ({
          ...prev,
          name: newName
        }));
      }
    }
  };
  
  // Handle adding new exercise to routine
  const handleAddExercise = async (e) => {
    e.preventDefault();
    
    if (!newExerciseData.exercise_id) {
      alert('Please select an exercise');
      return;
    }
    
    console.log('Adding exercise to routine with data:', newExerciseData);
    
    try {
      const newRoutineExercise = await addExerciseToRoutine(routineId, newExerciseData);
      console.log('New routine exercise added:', newRoutineExercise);
      
      if (newRoutineExercise) {
        setNewExerciseData({
          exercise_id: '',
          name: '',
          variation_type: 'Standard',
          sets: 3,
          reps: 10,
          weight: '',
          notes: ''
        });
        setShowAddExercise(false);
      }
    } catch (error) {
      console.error('Error adding exercise to routine:', error);
      alert('Failed to add exercise to routine');
    }
  };
  
  // Handle routine form submission
  const handleRoutineSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Submitting routine form with data:', routineFormData);
    console.log('Exercise form data:', exerciseFormData);
    
    try {
      // Update the routine first
      const updatedRoutine = await updateRoutine(routineId, routineFormData);
      console.log('Routine updated:', updatedRoutine);
      
      // Update exercises one by one using updateVariation
      for (const exercise of exerciseFormData) {
        console.log('Updating variation:', exercise);
        
        const variationData = {
          name: exercise.name,
          variation_type: exercise.variation_type,
          sets: parseInt(exercise.sets) || 0,
          reps: parseInt(exercise.reps) || 0,
          weight: exercise.weight ? parseFloat(exercise.weight) : null,
          notes: exercise.notes || ''
        };
        
        // Use updateVariation with routineId and variationId
        await updateVariation(routineId, exercise.variation_id, variationData);
      }
      
      alert('Routine updated successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error updating routine:', error);
      alert('Failed to update routine. Please try again.');
    }
  };
  
  // Handle exercise removal
  const handleRemoveExercise = async (variationId) => {
    if (window.confirm('Are you sure you want to remove this exercise from the routine?')) {
      console.log(`Removing exercise variation ${variationId} from routine ${routineId}`);
      
      try {
        await removeExerciseFromRoutine(routineId, variationId);
        console.log(`Exercise variation ${variationId} removed successfully`);
      } catch (error) {
        console.error('Error removing exercise from routine:', error);
        alert('Failed to remove exercise from routine');
      }
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/');
  };
  
  if (isLoading.initial) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="routine-detail-container loading">
          Loading routine details...
        </div>
      </div>
    );
  }
  
  if (errors.initial) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="routine-detail-container error">
          <div className="alert alert-danger">
            {errors.initial}
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
  
  // Get the exercises/variations from the routine
  const exerciseList = currentRoutine.exercises || currentRoutine.variations || [];
  
  return (
    <div className="app-container">
      <Navbar />
      
      <div className="routine-detail-container">
        <div className="routine-header">
          <h1>{currentRoutine.name}</h1>
          {currentRoutine.day_of_week && (
            <span className="day-badge">{currentRoutine.day_of_week}</span>
          )}
        </div>
        
        {currentRoutine.description && (
          <div className="routine-description">
            <p>{currentRoutine.description}</p>
          </div>
        )}
        
        <div className="routine-actions">
          <Link to="/" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
        
        <form onSubmit={handleRoutineSubmit}>
          <div className="edit-section">
            <h2>Edit Routine</h2>
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
          </div>
          
          <div className="exercises-section">
            <div className="exercises-header">
              <h2>Exercises in This Routine</h2>
              <button 
                type="button"
                className="btn btn-primary"
                onClick={() => setShowAddExercise(!showAddExercise)}
              >
                {showAddExercise ? 'Cancel' : 'Add Exercise'}
              </button>
            </div>
            
            {showAddExercise && (
              <div className="add-exercise-form">
                <h3>Add New Exercise</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="exercise_id">Select Exercise*</label>
                    <select
                      id="exercise_id"
                      className="form-control"
                      value={newExerciseData.exercise_id}
                      onChange={(e) => handleNewExerciseChange('exercise_id', e.target.value)}
                    >
                      <option value="">Select an exercise</option>
                      {exercises.map(exercise => (
                        <option key={exercise.id} value={exercise.id}>
                          {exercise.name} {exercise.muscle_group ? `(${exercise.muscle_group})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="variation_type">Variation Type</label>
                    <select
                      id="variation_type"
                      className="form-control"
                      value={newExerciseData.variation_type}
                      onChange={(e) => handleNewExerciseChange('variation_type', e.target.value)}
                    >
                      {variationTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="sets">Sets*</label>
                    <input
                      type="number"
                      id="sets"
                      className="form-control"
                      value={newExerciseData.sets}
                      onChange={(e) => handleNewExerciseChange('sets', e.target.value)}
                      min="1"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="reps">Reps*</label>
                    <input
                      type="number"
                      id="reps"
                      className="form-control"
                      value={newExerciseData.reps}
                      onChange={(e) => handleNewExerciseChange('reps', e.target.value)}
                      min="1"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="weight">Weight (lbs)</label>
                    <input
                      type="number"
                      id="weight"
                      className="form-control"
                      value={newExerciseData.weight}
                      onChange={(e) => handleNewExerciseChange('weight', e.target.value)}
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    className="form-control"
                    value={newExerciseData.notes}
                    onChange={(e) => handleNewExerciseChange('notes', e.target.value)}
                    rows="2"
                  ></textarea>
                </div>
                
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddExercise}
                  disabled={isLoading.form}
                >
                  {isLoading.form ? 'Adding...' : 'Add to Routine'}
                </button>
              </div>
            )}
            
            {exerciseList.length > 0 ? (
              <div className="exercise-list">
                {exerciseList.map((routineExercise, index) => {
                  console.log('Rendering exercise:', routineExercise);
                  
                  const exercise = routineExercise.exercise || 
                                  exercises.find(e => e.id === routineExercise.exercise_id) || 
                                  { name: routineExercise.name };
                  
                  return (
                    <div key={routineExercise.id} className="exercise-card">
                      <div className="exercise-header">
                        <h3 className="exercise-name">
                          {exercise.name || routineExercise.name}
                        </h3>
                        {exercise.muscle_group && (
                          <span className="exercise-muscle">{exercise.muscle_group}</span>
                        )}
                      </div>
                      
                      <div className="variation-info">
                        <div className="form-group">
                          <label>Variation Type</label>
                          <select
                            className="form-control"
                            value={exerciseFormData[index]?.variation_type || 'Standard'}
                            onChange={(e) => handleVariationChange(index, e.target.value)}
                          >
                            {variationTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        
                        {routineExercise.description && (
                          <div className="variation-description">
                            <p>{routineExercise.description}</p>
                          </div>
                        )}
                        
                        {exercise.equipment && (
                          <div className="exercise-equipment">
                            <span className="equipment-label">Equipment:</span> {exercise.equipment}
                          </div>
                        )}
                      </div>
                      
                      <div className="exercise-details">
                        <div className="form-row">
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
                        
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleRemoveExercise(routineExercise.id)}
                          disabled={isLoading.deletion === `${routineId}-${routineExercise.id}`}
                        >
                          {isLoading.deletion === `${routineId}-${routineExercise.id}` ? 'Removing...' : 'Remove Exercise'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-exercises">
                <p>No exercises added to this routine yet.</p>
                <p>Click "Add Exercise" to start building your routine.</p>
              </div>
            )}
          </div>
          
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
  );
};

export default RoutineDetail;