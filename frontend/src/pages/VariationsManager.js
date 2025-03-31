import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Navbar from '../components/Layout/Navbar';
import '../styles/VariationsManager.css';

const VariationsManager = () => {
  const navigate = useNavigate();
  const { 
    exercises, 
    routines,
    variationTypes,
    addExerciseToRoutine,
    createVariationType,
    updateExerciseVariation,
    isLoading, 
    errors
  } = useAppContext();
  
  // State for variations
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state for creating a new variation type
  const [newVariationType, setNewVariationType] = useState('');
  const [typeDescription, setTypeDescription] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  // State for adding exercise to routine
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseData, setExerciseData] = useState({
    variation_type: 'Standard',
    sets: 3,
    reps: 10,
    weight: '',
    notes: '',
    name: ''
  });
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Process variations from routines
  useEffect(() => {
    if (!routines || !exercises) return;
  
    try {
      setLoading(true);
      const allVariations = [];
  
      routines.forEach(routine => {
        // Ensure variations is an array, default to empty if not
        const routineVariations = Array.isArray(routine.variations) ? routine.variations : [];
  
        // Filter out null or invalid variations
        const validVariations = routineVariations.filter(variation =>
          variation && typeof variation === 'object' && variation.id && variation.exercise_id
        );
  
        const mappedVariations = validVariations.map(variation => {
          const exercise = exercises.find(ex => ex.id === variation.exercise_id);
  
          return {
            ...variation,
            variation_type: variation.variation_type || 'Standard', // Default if missing
            routine_name: routine.name,
            routine_day: routine.day_of_week,
            exercise_name: exercise ? exercise.name : 'Unknown Exercise',
            exercise_muscle_group: exercise ? exercise.muscle_group : '',
            exercise_equipment: exercise ? exercise.equipment : ''
          };
        });
  
        allVariations.push(...mappedVariations);
      });
  
      // Optional: Log to verify data
      console.log('Processed variations:', allVariations);
  
      setVariations(allVariations);
    } catch (err) {
      console.error('Error processing variations:', err);
      setError('Failed to process variations');
    } finally {
      setLoading(false);
    }
  }, [routines, exercises]);
  
  // Handle variation type change for a variation
  const handleVariationTypeChange = async (variationId, newVariationType) => {
    try {
      const variationData = {
        variation_type: newVariationType || 'Standard',
      };
      
      const updatedVariation = await updateExerciseVariation(variationId, variationData);
      
      setVariations(prev =>
        prev.map(variation =>
          variation.id === variationId
            ? {
                ...variation,
                variation_type: updatedVariation.variation_type
              }
            : variation
        )
      );
    } catch (error) {
      console.error('Failed to update variation type:', error);
      setError('Failed to update variation type. Please try again.');
    }
  };
  
  // Filter variations based on filters
  const filteredVariations = variations.filter(variation => {
    if (!variation) return false; // Extra safety check
    
    if (searchTerm && !variation.exercise_name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (muscleGroupFilter && variation.exercise_muscle_group !== muscleGroupFilter) {
      return false;
    }
    
    if (typeFilter && variation.variation_type !== typeFilter) {
      return false;
    }
    
    return true;
  });
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setMuscleGroupFilter('');
    setTypeFilter('');
  };
  
  // Validate variation type form
  const validateTypeForm = () => {
    const errors = {};
    
    if (!newVariationType.trim()) {
      errors.type = 'Variation type name is required';
    } else if (newVariationType.length > 50) {
      errors.type = 'Type name must be less than 50 characters';
    }
    
    if (newVariationType && variationTypes.some(t => t.name.toLowerCase() === newVariationType.toLowerCase())) {
      errors.type = 'This variation type already exists';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create variation type
  const handleCreateType = async (e) => {
    e.preventDefault();
    
    if (!validateTypeForm()) {
      return;
    }
    
    try {
      const result = await createVariationType(newVariationType, typeDescription);
      if (result) {
        alert(`New variation type "${newVariationType}" has been created!`);
        setNewVariationType('');
        setTypeDescription('');
      }
    } catch (error) {
      console.error('Error creating variation type:', error);
      alert('Failed to create variation type. Please try again.');
    }
  };
  
  // Handle exercise selection
  const handleExerciseSelect = (exerciseId) => {
    const exercise = exercises.find(ex => ex.id === parseInt(exerciseId, 10));
    if (exercise) {
      setSelectedExercise(exercise);
      setExerciseData(prev => ({
        ...prev,
        name: `${exercise.name} (${prev.variation_type})`
      }));
    }
  };
  
  // Handle exercise data change
  const handleExerciseDataChange = (e) => {
    const { name, value } = e.target;
    setExerciseData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'variation_type' && selectedExercise) {
      setExerciseData(prev => ({
        ...prev,
        name: `${selectedExercise.name} (${value})`
      }));
    }
  };
  
  // Handle add to routine
  const handleAddToRoutine = async (e) => {
    e.preventDefault();
    
    if (!selectedRoutine || !selectedExercise) {
      alert('Please select both a routine and an exercise');
      return;
    }
    
    try {
      const variationData = {
        exercise_id: selectedExercise.id,
        name: exerciseData.name,
        variation_type: exerciseData.variation_type,
        sets: parseInt(exerciseData.sets),
        reps: parseInt(exerciseData.reps),
        weight: exerciseData.weight ? parseFloat(exerciseData.weight) : null,
        notes: exerciseData.notes
      };
      
      const result = await addExerciseToRoutine(selectedRoutine, variationData);
      if (result) {
        alert('Exercise variation added to routine successfully!');
        setSelectedRoutine('');
        setSelectedExercise(null);
        setExerciseData({
          variation_type: 'Standard',
          sets: 3,
          reps: 10,
          weight: '',
          notes: '',
          name: ''
        });
        setShowAddExercise(false);
      }
    } catch (error) {
      console.error('Error adding variation to routine:', error);
      alert('Failed to add variation to routine. Please try again.');
    }
  };
  
  return (
    <div className="app-container">
      <Navbar />
      
      <div className="variations-manager-container">
        <div className="variations-header">
          <div>
            <h1>Exercise Variations Manager</h1>
            <p>Browse and manage exercise variations across your routines</p>
          </div>
          <div>
            <button 
              type="button"
              className="btn btn-primary"
              onClick={() => setShowAddExercise(!showAddExercise)}
            >
              {showAddExercise ? 'Cancel' : 'Add Exercise to Routine'}
            </button>
          </div>
        </div>
        
        {/* Form to create a new variation type */}
        <div className="variation-form-container">
          <h2>Create New Variation Type</h2>
          <p>Add a new way to perform exercises in your routines</p>
          
          <form className="variation-form" onSubmit={handleCreateType}>
            <div className="form-group">
              <label htmlFor="type-name">Variation Type Name*</label>
              <input
                type="text"
                id="type-name"
                className="form-control"
                value={newVariationType}
                onChange={(e) => setNewVariationType(e.target.value)}
                placeholder="e.g., Isometric, Eccentric Focus, Resistance Band"
              />
              {validationErrors.type && (
                <div className="error-message">{validationErrors.type}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="type-description">Description</label>
              <textarea
                id="type-description"
                className="form-control"
                value={typeDescription}
                onChange={(e) => setTypeDescription(e.target.value)}
                rows="3"
                placeholder="Explain how this variation is performed or what makes it unique"
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading.form}
              >
                {isLoading.form ? 'Creating...' : 'Create Variation Type'}
              </button>
            </div>
          </form>
        </div>
        
        {/* List of existing variation types */}
        <div className="existing-variations-section">
          <h2>Available Variation Types</h2>
          <div className="variations-grid">
            {variationTypes.map(type => (
              <div key={type.id} className="variation-type-card">
                <h3>{type.name}</h3>
                {type.description && (
                  <div className="type-description">
                    <p>{type.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Add exercise to routine form */}
        {showAddExercise && (
          <div className="add-exercise-section">
            <h2>Add Exercise to Routine with Variation</h2>
            <p>Select an exercise, choose a variation type, and add it to a routine</p>
            
            <form className="variation-form" onSubmit={handleAddToRoutine}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="routine-select">Select Routine*</label>
                  <select
                    id="routine-select"
                    className="form-control"
                    value={selectedRoutine}
                    onChange={(e) => setSelectedRoutine(e.target.value)}
                  >
                    <option value="">Select a routine</option>
                    {routines.map(routine => (
                      <option key={routine.id} value={routine.id}>
                        {routine.name} {routine.day_of_week ? `(${routine.day_of_week})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="exercise-select">Select Exercise*</label>
                  <select
                    id="exercise-select"
                    className="form-control"
                    value={selectedExercise ? selectedExercise.id : ''}
                    onChange={(e) => handleExerciseSelect(e.target.value)}
                  >
                    <option value="">Select an exercise</option>
                    {exercises.map(exercise => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name} {exercise.muscle_group ? `(${exercise.muscle_group})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="variation-type">Variation Type</label>
                  <select
                    id="variation-type"
                    name="variation_type"
                    className="form-control"
                    value={exerciseData.variation_type}
                    onChange={handleExerciseDataChange}
                  >
                    {variationTypes.map(type => (
                      <option key={type.id} value={type.name}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="variation-name">Variation Name</label>
                  <input
                    type="text"
                    id="variation-name"
                    name="name"
                    className="form-control"
                    value={exerciseData.name}
                    onChange={handleExerciseDataChange}
                    placeholder="Name will be auto-generated based on exercise and variation type"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sets">Sets*</label>
                  <input
                    type="number"
                    id="sets"
                    name="sets"
                    className="form-control"
                    value={exerciseData.sets}
                    onChange={handleExerciseDataChange}
                    min="1"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="reps">Reps*</label>
                  <input
                    type="number"
                    id="reps"
                    name="reps"
                    className="form-control"
                    value={exerciseData.reps}
                    onChange={handleExerciseDataChange}
                    min="1"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="weight">Weight (lbs)</label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    className="form-control"
                    value={exerciseData.weight}
                    onChange={handleExerciseDataChange}
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-control"
                  value={exerciseData.notes}
                  onChange={handleExerciseDataChange}
                  rows="3"
                  placeholder="Optional form cues or special instructions"
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading.form}
                >
                  {isLoading.form ? 'Adding...' : 'Add to Routine'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Existing Variations - with filters */}
        <div className="routine-variations-section">
          <h2>Existing Exercise Variations</h2>
          
          <div className="filter-controls">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Search variations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-selects">
              <select
                className="filter-select"
                value={muscleGroupFilter}
                onChange={(e) => setMuscleGroupFilter(e.target.value)}
              >
                <option value="">All Muscle Groups</option>
                {[...new Set(variations.map(v => v.exercise_muscle_group).filter(Boolean))].map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
              
              <select
                className="filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Variation Types</option>
                {variationTypes.map(type => (
                  <option key={type.id} value={type.name}>{type.name}</option>
                ))}
              </select>
              
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          {/* Variations list */}
          <div className="variations-list">
            {loading ? (
              <div className="loading">Loading variations...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : filteredVariations.length === 0 ? (
              <div className="no-variations">
                <p>No variations found{searchTerm || muscleGroupFilter || typeFilter ? ' matching your filters' : ''}.</p>
                {(searchTerm || muscleGroupFilter || typeFilter) && (
                  <button 
                    type="button"
                    className="btn btn-link"
                    onClick={resetFilters}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="variations-grid">
                {filteredVariations.map((variation, index) => (
                  <div key={variation.id} className="variation-card">
                    <h3>{variation.exercise_name}</h3>
                    
                    <div className="variation-exercise">
                      <span>Exercise:</span> {variation.exercise_name}
                      {variation.exercise_muscle_group && (
                        <span className="muscle-badge">{variation.exercise_muscle_group}</span>
                      )}
                    </div>
                    
                    <div className="variation-type">
                      <label>Type:</label>
                      <select
                        className="form-control"
                        value={variation.variation_type || 'Standard'}
                        onChange={(e) => handleVariationTypeChange(variation.id, e.target.value)}
                      >
                        {variationTypes.map(type => (
                          <option key={type.id} value={type.name}>{type.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="variation-routine">
                      <span>Routine:</span> 
                      <Link to={`/routines/${variation.routine_id}`}>
                        {variation.routine_name}
                      </Link>
                      {variation.routine_day && ` (${variation.routine_day})`}
                    </div>
                    
                    <div className="variation-metrics">
                      <div className="metric">
                        <span className="metric-label">Sets</span>
                        <span className="metric-value">{variation.sets}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Reps</span>
                        <span className="metric-value">{variation.reps}</span>
                      </div>
                      {variation.weight && (
                        <div className="metric">
                          <span className="metric-label">Weight</span>
                          <span className="metric-value">{variation.weight} lbs</span>
                        </div>
                      )}
                    </div>
                    
                    {variation.notes && (
                      <div className="variation-notes">
                        <p>{variation.notes}</p>
                      </div>
                    )}
                    
                    <div className="variation-actions">
                      <Link 
                        to={`/routines/${variation.routine_id}/exercises`} 
                        className="btn btn-secondary"
                      >
                        Edit in Routine
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="variations-footer">
          <p>Found {filteredVariations.length} variations</p>
          <div className="footer-links">
            <Link to="/exercises" className="btn btn-secondary">
              Exercise Library
            </Link>
            <Link to="/" className="btn btn-secondary">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariationsManager;