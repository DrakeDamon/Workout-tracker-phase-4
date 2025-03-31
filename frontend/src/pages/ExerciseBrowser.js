import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Navbar from '../components/Layout/Navbar';
import '../styles/ExerciseBrowser.css';

const ExerciseBrowser = () => {
  const { 
    exercises, 
    muscleGroups, 
    equipment, 
    routines,
    isLoading, 
    createExercise,
    addExerciseToRoutine, 
    errors 
  } = useAppContext();
  
  const navigate = useNavigate();
  
  // **State Declarations**
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [selectedRoutineId, setSelectedRoutineId] = useState('');
  
  // Add exercise to routine state
  const [showAddToRoutine, setShowAddToRoutine] = useState(false);
  const [exerciseToAdd, setExerciseToAdd] = useState(null);
  const [variationData, setVariationData] = useState({
    name: '',
    variation_type: 'Standard',
    sets: 3,
    reps: 10,
    weight: '',
    notes: ''
  });
  
  // Form state for creating new exercise
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    muscle_group: '',
    equipment: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  
  // Filtered exercises and variations
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [exerciseVariations, setExerciseVariations] = useState({});
  
  // **Constants**
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

  // Predefined muscle groups and equipment options
  const defaultMuscleGroups = [
    'Chest',
    'Back',
    'Legs',
    'Shoulders',
    'Arms',
    'Core',
    'Cardio'
  ];

  const defaultEquipment = [
    'Barbell',
    'Dumbbell',
    'Machine',
    'Cable',
    'Bodyweight',
    'None'
  ];
  
  // **Effects**
  // Effect to filter exercises
  useEffect(() => {
    if (!exercises || !Array.isArray(exercises)) return;
    
    let result = [...exercises];
    
    if (searchTerm) {
      result = result.filter(exercise => 
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (muscleGroupFilter) {
      result = result.filter(exercise => 
        exercise.muscle_group === muscleGroupFilter
      );
    }
    
    if (equipmentFilter) {
      result = result.filter(exercise => 
        exercise.equipment === equipmentFilter
      );
    }
    
    setFilteredExercises(result);
  }, [exercises, searchTerm, muscleGroupFilter, equipmentFilter]);
  
  // Effect to aggregate exercise variations
  useEffect(() => {
    if (!routines || !exercises) {
      console.log('Missing routines or exercises:', { routines, exercises });
      return;
    }

    const variationsMap = {};
    exercises.forEach(exercise => {
      variationsMap[exercise.id] = [];
    });

    routines.forEach(routine => {
      const routineVariations = Array.isArray(routine.variations) ? routine.variations : [];
      routineVariations.forEach(variation => {
        if (!variation || !variation.exercise_id) {
          console.log('Invalid variation:', variation);
          return;
        }
        const exerciseId = variation.exercise_id;
        if (variationsMap[exerciseId]) {
          variationsMap[exerciseId].push({
            id: variation.id,
            name: variation.name,
            variation_type: variation.variation_type || 'Standard'
          });
        }
      });
    });

    console.log('Final exercise variations map:', variationsMap);
    setExerciseVariations(variationsMap);
  }, [routines, exercises]);
  
  // **Handlers**
  const resetFilters = () => {
    setSearchTerm('');
    setMuscleGroupFilter('');
    setEquipmentFilter('');
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleVariationChange = (e) => {
    const { name, value } = e.target;
    setVariationData({
      ...variationData,
      [name]: value
    });
    
    if (name === 'variation_type' && exerciseToAdd) {
      setVariationData(prev => ({
        ...prev,
        name: `${exerciseToAdd.name} (${value})`
      }));
    }
  };
  
  const handleAddToRoutine = async (e) => {
    e.preventDefault();
    
    if (!selectedRoutineId) {
      alert('Please select a routine');
      return;
    }
    
    if (!exerciseToAdd) {
      alert('No exercise selected');
      return;
    }
    
    const exerciseData = {
      exercise_id: exerciseToAdd.id,
      name: variationData.name,
      variation_type: variationData.variation_type,
      sets: parseInt(variationData.sets),
      reps: parseInt(variationData.reps),
      weight: variationData.weight ? parseFloat(variationData.weight) : null,
      notes: variationData.notes
    };
    
    try {
      console.log(`Adding exercise ${exerciseToAdd.id} to routine ${selectedRoutineId}:`, exerciseData);
      const result = await addExerciseToRoutine(selectedRoutineId, exerciseData);
      console.log('Exercise added to routine:', result);
      
      if (result) {
        alert(`Added "${exerciseToAdd.name}" to the routine successfully!`);
        setShowAddToRoutine(false);
        setExerciseToAdd(null);
        setSelectedRoutineId('');
        setVariationData({
          name: '',
          variation_type: 'Standard',
          sets: 3,
          reps: 10,
          weight: '',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error adding exercise to routine:', error);
      alert('Failed to add exercise to routine');
    }
  };
  
  const selectExerciseToAdd = (exercise) => {
    setExerciseToAdd(exercise);
    setVariationData({
      name: `${exercise.name} (Standard)`,
      variation_type: 'Standard',
      sets: 3,
      reps: 10,
      weight: '',
      notes: ''
    });
    setShowAddToRoutine(true);
  };
  
  const cancelAddToRoutine = () => {
    setShowAddToRoutine(false);
    setExerciseToAdd(null);
    setSelectedRoutineId('');
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Exercise name is required';
    } else if (formData.name.length > 100) {
      errors.name = 'Name must be less than 100 characters';
    }
    
    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const newExercise = await createExercise(formData);
      if (newExercise) {
        console.log('New exercise created:', newExercise);
        setFormData({
          name: '',
          description: '',
          muscle_group: '',
          equipment: ''
        });
        alert('Exercise created successfully!');
      }
    } catch (error) {
      console.error('Error creating exercise:', error);
    }
  };
  
  // **Render**
  return (
    <div className="app-container">
      <Navbar />
      
      <div className="exercise-browser-container">
        <div className="exercise-browser-header">
          <h1>Exercise Library</h1>
          <p>Browse our collection of exercises or add your own</p>
        </div>
        
        <div className="filter-controls">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Add Exercise to Routine Modal */}
        {showAddToRoutine && exerciseToAdd && (
          <div className="add-to-routine-modal">
            <div className="modal-header">
              <h3>Add {exerciseToAdd.name} to Routine</h3>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={cancelAddToRoutine}
              >
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleAddToRoutine}>
              <div className="form-group">
                <label htmlFor="routine_id">Select Routine*</label>
                <select
                  id="routine_id"
                  className="form-control"
                  value={selectedRoutineId}
                  onChange={(e) => setSelectedRoutineId(e.target.value)}
                  required
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
                <label htmlFor="variation_type">Variation Type</label>
                <select
                  id="variation_type"
                  name="variation_type"
                  className="form-control"
                  value={variationData.variation_type}
                  onChange={handleVariationChange}
                >
                  {variationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <small className="form-text text-muted">
                  This determines how the exercise will be performed in your routine
                </small>
              </div>
              
              <div className="form-group">
                <label htmlFor="name">Variation Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={variationData.name}
                  onChange={handleVariationChange}
                />
                <small className="form-text text-muted">
                  A descriptive name for this variation (auto-generated based on type)
                </small>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sets">Sets*</label>
                  <input
                    type="number"
                    id="sets"
                    name="sets"
                    className="form-control"
                    value={variationData.sets}
                    onChange={handleVariationChange}
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
                    value={variationData.reps}
                    onChange={handleVariationChange}
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
                    value={variationData.weight}
                    onChange={handleVariationChange}
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
                  value={variationData.notes}
                  onChange={handleVariationChange}
                  rows="2"
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
        
        {/* Create Exercise Form */}
        <div className="exercise-form-container">
          <h2>Create New Exercise</h2>
          
          {errors.form && (
            <div className="alert alert-danger">{errors.form}</div>
          )}
          
          <form className="exercise-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Exercise Name*</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading.form}
                required
              />
              {validationErrors.name && <div className="error-message">{validationErrors.name}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="muscle_group">Muscle Group</label>
              <select
                id="muscle_group"
                name="muscle_group"
                className="form-control"
                value={formData.muscle_group}
                onChange={handleChange}
                disabled={isLoading.form}
              >
                <option value="">Select Muscle Group</option>
                {defaultMuscleGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="equipment">Equipment</label>
              <select
                id="equipment"
                name="equipment"
                className="form-control"
                value={formData.equipment}
                onChange={handleChange}
                disabled={isLoading.form}
              >
                <option value="">Select Equipment</option>
                {defaultEquipment.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                disabled={isLoading.form}
              />
              {validationErrors.description && <div className="error-message">{validationErrors.description}</div>}
            </div>
            
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading.form}
              >
                {isLoading.form ? 'Creating...' : 'Create Exercise'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Exercise List */}
        <div className="exercise-results">
          {isLoading.initial ? (
            <div className="loading">Loading exercises...</div>
          ) : filteredExercises.length === 0 ? (
            <div className="no-exercises">
              <p>No exercises found matching your filters.</p>
              <button 
                className="btn btn-link"
                onClick={resetFilters}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="exercise-grid">
              {filteredExercises.map(exercise => (
                <div key={exercise.id} className="exercise-card">
                  <h3>{exercise.name}</h3>
                  
                  {exercise.description && (
                    <div className="exercise-description">
                      <p>
                        {exercise.description.substring(0, 100)}
                        {exercise.description.length > 100 ? '...' : ''}
                      </p>
                    </div>
                  )}
                  
                  {exerciseVariations[exercise.id] && exerciseVariations[exercise.id].length > 0 && (
                    <div className="exercise-variations">
                      <h4>Variations:</h4>
                      <ul>
                        {exerciseVariations[exercise.id].map(variation => (
                          <li key={variation.id}>
                            <strong>{variation.variation_type}</strong> - {variation.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="exercise-actions">

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="exercise-browser-footer">
          <p>Found {filteredExercises.length} exercises</p>
        </div>
      </div>
    </div>
  );
};

export default ExerciseBrowser;