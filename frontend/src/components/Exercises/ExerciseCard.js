// frontend/src/components/Exercises/ExerciseCard.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import '../../styles/ExerciseCard.css';

const ExerciseCard = ({ exercise, onAdd }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id, name, description, muscle_group, equipment } = exercise;
  const { routines, addExerciseToRoutine, isLoading } = useAppContext();
  
  const [showRoutineSelect, setShowRoutineSelect] = useState(false);
  const [selectedRoutineId, setSelectedRoutineId] = useState('');
  const [formData, setFormData] = useState({
    sets: 3,
    reps: 10,
    weight: '',
    notes: ''
  });
  
  const isAddExerciseContext = location.pathname.includes('/add-exercise');
  const isBrowserContext = location.pathname === '/exercise-browser';
  const isSubmitting = isLoading.submission;

  const getRoutineIdFromPath = () => {
    if (isAddExerciseContext) {
      const pathParts = location.pathname.split('/');
      // Find the index after 'add-exercise'
      const routineIdIndex = pathParts.indexOf('add-exercise') - 1;
      return pathParts[routineIdIndex];
    }
    return null;
  };

  const routineId = getRoutineIdFromPath();

  const handleAddToRoutine = () => {
    if (isAddExerciseContext && routineId) {
      navigate(`/add-exercise/${routineId}/${id}`);
    } else if (isBrowserContext) {
      setShowRoutineSelect(true);
    }
  };
  
  const handleRoutineSelect = (e) => {
    setSelectedRoutineId(e.target.value);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRoutineId) {
      alert('Please select a routine');
      return;
    }
    
    try {
      const exerciseData = {
        exercise_id: id,
        sets: parseInt(formData.sets, 10),
        reps: parseInt(formData.reps, 10),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        notes: formData.notes || null
      };
      
      await addExerciseToRoutine(selectedRoutineId, exerciseData);
      
      // Reset form and close selection
      setFormData({
        sets: 3,
        reps: 10,
        weight: '',
        notes: ''
      });
      setSelectedRoutineId('');
      setShowRoutineSelect(false);
      
      alert(`Successfully added ${name} to routine!`);
    } catch (error) {
      console.error('Error adding exercise to routine:', error);
      alert('Failed to add exercise to routine. Please try again.');
    }
  };
  
  const handleCancel = () => {
    setShowRoutineSelect(false);
    setSelectedRoutineId('');
  };

  return (
    <div className="exercise-card">
      <div className="exercise-card-header">
        <h3>{name}</h3>
        <div className="exercise-badges">
          {muscle_group && <span className="badge muscle-badge">{muscle_group}</span>}
          {equipment && <span className="badge equipment-badge">{equipment}</span>}
        </div>
      </div>

      <div className="exercise-card-body">
        {description && <p className="exercise-description">{description}</p>}
      </div>

      <div className="exercise-card-footer">
        {!showRoutineSelect ? (
          <>
            {isAddExerciseContext && (
              <button onClick={handleAddToRoutine} className="btn btn-primary">
                Add to Routine
              </button>
            )}
            {isBrowserContext && (
              <button onClick={handleAddToRoutine} className="btn btn-primary">
                Add to Routine
              </button>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit} className="add-to-routine-form">
            <div className="form-group">
              <label htmlFor={`routine-select-${id}`}>Select Routine:</label>
              <select 
                id={`routine-select-${id}`}
                value={selectedRoutineId}
                onChange={handleRoutineSelect}
                className="form-control"
                required
              >
                <option value="">Select a routine</option>
                {routines.map(routine => (
                  <option key={routine.id} value={routine.id}>
                    {routine.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor={`sets-${id}`}>Sets:</label>
                <input
                  type="number"
                  id={`sets-${id}`}
                  name="sets"
                  value={formData.sets}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                  min="1"
                />
              </div>
              
              <div className="form-group half">
                <label htmlFor={`reps-${id}`}>Reps:</label>
                <input
                  type="number"
                  id={`reps-${id}`}
                  name="reps"
                  value={formData.reps}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                  min="1"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor={`weight-${id}`}>Weight (optional):</label>
              <input
                type="number"
                id={`weight-${id}`}
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="form-control"
                step="0.5"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor={`notes-${id}`}>Notes (optional):</label>
              <textarea
                id={`notes-${id}`}
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-control"
                rows="2"
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                onClick={handleCancel} 
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Exercise'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ExerciseCard;