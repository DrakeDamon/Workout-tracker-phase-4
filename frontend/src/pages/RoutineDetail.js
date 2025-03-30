import React, { useEffect, useState } from 'react';
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
    updateRoutineExercise,
    deleteRoutineExercise,
    addExerciseToRoutine,
    exercises,
    variations,
    isLoading, 
    errors
  } = useAppContext();
  
  // Form state for routine
  const [routineFormData, setRoutineFormData] = useState({
    name: '',
    day_of_week: '',
    description: ''
  });
  
  // Form state for variations in this routine
  const [variationFormData, setVariationFormData] = useState([]);
  
  // Day of week options
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
    'Friday', 'Saturday', 'Sunday'
  ];
  
  // Load routine details on component mount
  useEffect(() => {
    const routine = getRoutineById(routineId);
    
    if (routine) {
      setRoutineFormData({
        name: routine.name || '',
        day_of_week: routine.day_of_week || '',
        description: routine.description || ''
      });
      
      // Initialize variation form data from routine's variations
      if (routine.variations) {
        const variationsData = routine.variations.map(variation => ({
          id: variation.id,
          exercise_id: variation.exercise_id,
          variation_id: variation.id, // Currently selected variation
          sets: variation.sets || '',
          reps: variation.reps || '',
          weight: variation.weight || '',
          notes: variation.notes || ''
        }));
        setVariationFormData(variationsData);
      }
    }
  }, [routineId, getRoutineById]);
  
  // Handle routine input changes
  const handleRoutineChange = (e) => {
    const { name, value } = e.target;
    setRoutineFormData({
      ...routineFormData,
      [name]: value
    });
  };
  
  // Handle variation input changes
  const handleVariationChange = (index, field, value) => {
    const updatedVariations = [...variationFormData];
    updatedVariations[index] = {
      ...updatedVariations[index],
      [field]: value
    };
    setVariationFormData(updatedVariations);
  };
  
  // Handle variation selection change
  const handleVariationSelect = async (index, newVariationId) => {
    const variationToUpdate = variationFormData[index];
    const currentVariationId = variationToUpdate.id;
    
    // If selecting the same variation, do nothing
    if (currentVariationId === parseInt(newVariationId, 10)) {
      return;
    }
    
    try {
      // First, delete the current variation from the routine
      await deleteRoutineExercise(currentVariationId);
      
      // Find the new variation to add
      const newVariation = variations.find(v => v.id === parseInt(newVariationId, 10));
      
      // Add the new variation to the routine
      const addedVariation = await addExerciseToRoutine(routineId, {
        exercise_id: variationToUpdate.exercise_id,
        variation_id: newVariationId,
        name: newVariation ? newVariation.name : "Selected Variation",
        sets: variationToUpdate.sets,
        reps: variationToUpdate.reps,
        weight: variationToUpdate.weight,
        notes: variationToUpdate.notes
      });
      
      // Update the form data with the new variation
      const updatedVariations = [...variationFormData];
      updatedVariations[index] = {
        ...updatedVariations[index],
        id: addedVariation.id,
        variation_id: addedVariation.id
      };
      setVariationFormData(updatedVariations);
      
      // Refresh the routine
      getRoutineById(routineId);
      
    } catch (error) {
      console.error('Error changing variation:', error);
      alert('Failed to change variation. Please try again.');
    }
  };
  
  // Handle routine form submission
  const handleRoutineSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Update the routine first
      const updatedRoutine = await updateRoutine(routineId, routineFormData);
      
      // Update variations one by one
      for (const variation of variationFormData) {
        // Create a clean data object with only the fields your API expects
        const variationData = {
          sets: parseInt(variation.sets) || 0,
          reps: parseInt(variation.reps) || 0,
          weight: variation.weight ? parseFloat(variation.weight) : null,
          notes: variation.notes || ''
        };
        
        await updateRoutineExercise(variation.id, variationData);
      }
      
      alert('Routine updated successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error updating routine:', error);
      alert('Failed to update routine. Please try again.');
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/');
  };
  
  // Find exercise details for a given exercise ID
  const findExercise = (exerciseId) => {
    return exercises.find(ex => ex.id === exerciseId);
  };
  
  // Get all variations for a given exercise
  const getExerciseVariations = (exerciseId) => {
    return variations.filter(v => v.exercise_id === exerciseId);
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
  
  // Group variations by exercise
  const exerciseVariations = {};
  
  if (currentRoutine.variations) {
    currentRoutine.variations.forEach(variation => {
      // In our model, each exercise should appear only once in a routine
      // So we're just storing the current variation for each exercise
      exerciseVariations[variation.exercise_id] = variation;
    });
  }
  
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
            <h2>Exercises in This Routine</h2>
            
            {Object.keys(exerciseVariations).length > 0 ? (
              <div className="exercise-list">
                {Object.entries(exerciseVariations).map(([exerciseId, currentVariation], index) => {
                  const exercise = findExercise(parseInt(exerciseId, 10));
                  const allVariations = getExerciseVariations(parseInt(exerciseId, 10));
                  
                  return (
                    <div key={exerciseId} className="exercise-card">
                      <div className="exercise-header">
                        <h3 className="exercise-name">{exercise ? exercise.name : 'Unknown Exercise'}</h3>
                        {exercise?.muscle_group && (
                          <span className="exercise-muscle">{exercise.muscle_group}</span>
                        )}
                      </div>
                      
                      <div className="variation-selection">
                        <label htmlFor={`variation-select-${index}`}>
                          Select Variation:
                        </label>
                        <select
                          id={`variation-select-${index}`}
                          className="form-control"
                          value={currentVariation.id}
                          onChange={(e) => handleVariationSelect(index, e.target.value)}
                        >
                          {allVariations.map(variation => (
                            <option key={variation.id} value={variation.id}>
                              {variation.name} {variation.variation_type ? `(${variation.variation_type})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="variation-info">
                        <h4>Current Variation: {currentVariation.name}</h4>
                        {currentVariation.variation_type && (
                          <span className="variation-type">{currentVariation.variation_type}</span>
                        )}
                        
                        {currentVariation.description && (
                          <div className="variation-description">
                            <p>{currentVariation.description}</p>
                          </div>
                        )}
                        
                        {exercise?.equipment && (
                          <div className="exercise-equipment">
                            <span className="equipment-label">Equipment:</span> {exercise.equipment}
                          </div>
                        )}
                      </div>
                      
                      <div className="exercise-details">
                        <div className="form-group">
                          <label>Sets</label>
                          <input
                            type="number"
                            className="form-control"
                            value={variationFormData[index]?.sets || ''}
                            onChange={(e) => handleVariationChange(index, 'sets', e.target.value)}
                            min="1"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Reps</label>
                          <input
                            type="number"
                            className="form-control"
                            value={variationFormData[index]?.reps || ''}
                            onChange={(e) => handleVariationChange(index, 'reps', e.target.value)}
                            min="1"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Weight (lbs)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={variationFormData[index]?.weight || ''}
                            onChange={(e) => handleVariationChange(index, 'weight', e.target.value)}
                            min="0"
                            step="0.5"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Notes</label>
                          <textarea
                            className="form-control"
                            value={variationFormData[index]?.notes || ''}
                            onChange={(e) => handleVariationChange(index, 'notes', e.target.value)}
                            rows="2"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-exercises">
                <p>No exercises added to this routine yet.</p>
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