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
    isLoading, 
    errors
  } = useAppContext();
  
  // State for variations and variation types
  const [variations, setVariations] = useState([]);
  const [variationTypes, setVariationTypes] = useState([
    { id: 1, name: 'Standard', description: 'The basic way to perform the exercise', isDefault: true },
    { id: 2, name: 'Width Variation', description: 'Altering grip or stance width to target different muscles', isDefault: true },
    { id: 3, name: 'Angle Variation', description: 'Changing the angle of the movement (incline, decline, etc.)', isDefault: true },
    { id: 4, name: 'Grip Variation', description: 'Different grip styles (overhand, underhand, neutral)', isDefault: true },
    { id: 5, name: 'Tempo Variation', description: 'Changing the speed or adding pauses to the movement', isDefault: true },
    { id: 6, name: 'Power', description: 'Explosive movement variations focusing on power', isDefault: true },
    { id: 7, name: 'Endurance', description: 'Higher repetition versions focusing on muscular endurance', isDefault: true },
    { id: 8, name: 'Other', description: 'Custom variation types', isDefault: true }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [exerciseFilter, setExerciseFilter] = useState('');
  const [routineFilter, setRoutineFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state for creating a new variation type
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});
  
  // Process variations from routines - not fetching, just transforming data
  useEffect(() => {
    if (!routines || !exercises) return;
    
    try {
      setLoading(true);
      const allVariations = [];
      
      // For each routine, get its exercises/variations that are already loaded
      routines.forEach(routine => {
        const routineVariations = routine.variations || routine.exercises || [];
        
        // Add routine info to each variation for easier filtering/display
        const mappedVariations = routineVariations.map(variation => {
          const exercise = exercises.find(ex => ex.id === variation.exercise_id);
          
          return {
            ...variation,
            routine_name: routine.name,
            routine_day: routine.day_of_week,
            exercise_name: exercise ? exercise.name : 'Unknown Exercise',
            exercise_muscle_group: exercise ? exercise.muscle_group : '',
            exercise_equipment: exercise ? exercise.equipment : ''
          };
        });
        
        allVariations.push(...mappedVariations);
      });
      
      setVariations(allVariations);
    } catch (err) {
      console.error('Error processing variations:', err);
      setError('Failed to process variations');
    } finally {
      setLoading(false);
    }
  }, [routines, exercises]);
  
  // Filter variations based on filters
  const filteredVariations = variations.filter(variation => {
    // Filter by exercise
    if (exerciseFilter && variation.exercise_id !== parseInt(exerciseFilter, 10)) {
      return false;
    }
    
    // Filter by routine
    if (routineFilter && variation.routine_id !== parseInt(routineFilter, 10)) {
      return false;
    }
    
    // Filter by variation type
    if (typeFilter && variation.variation_type !== typeFilter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      // Search in name, exercise name, routine name, or variation type
      return (
        variation.name?.toLowerCase().includes(lowerSearch) ||
        variation.exercise_name?.toLowerCase().includes(lowerSearch) ||
        variation.routine_name?.toLowerCase().includes(lowerSearch) ||
        variation.variation_type?.toLowerCase().includes(lowerSearch)
      );
    }
    
    return true;
  });
  
  // Reset filters
  const resetFilters = () => {
    setExerciseFilter('');
    setRoutineFilter('');
    setTypeFilter('');
    setSearchTerm('');
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error when field is updated
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };
  
  // Validate the form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Variation type name is required';
    } else if (formData.name.length > 50) {
      errors.name = 'Name must be less than 50 characters';
    }
    
    if (formData.description && formData.description.length > 200) {
      errors.description = 'Description must be less than 200 characters';
    }
    
    // Check if variation name already exists
    if (formData.name && variationTypes.some(v => 
      v.name.toLowerCase() === formData.name.toLowerCase())) {
      errors.name = 'A variation type with this name already exists';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Create a new variation type
      const nextId = Math.max(...variationTypes.map(v => v.id), 0) + 1;
      const newVariationType = {
        id: nextId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        isDefault: false
      };
      
      // Add to local state
      setVariationTypes([...variationTypes, newVariationType]);
      
      // Reset form
      setFormData({
        name: '',
        description: ''
      });
      
      alert('Variation type created successfully!');
    } catch (error) {
      console.error('Error creating variation type:', error);
      alert('Failed to create variation type. Please try again.');
    }
  };
  
  // Handle delete variation type
  const handleDeleteVariationType = (typeId) => {
    if (window.confirm('Are you sure you want to delete this variation type?')) {
      try {
        setVariationTypes(variationTypes.filter(v => v.id !== typeId));
      } catch (error) {
        console.error('Error deleting variation type:', error);
        alert('Failed to delete variation type');
      }
    }
  };
  
  return (
    <div className="app-container">
      <Navbar />
      
      <div className="variations-manager-container">
        <div className="variations-header">
          <div>
            <h1>Exercise Variations Manager</h1>
          </div>
        </div>
        
        {/* Create Variation Type Section */}
        <div className="create-variation-section">
          <h2>Create New Variation Type</h2>
          <p>Add a new way to perform exercises in your routines</p>
          
          <form className="variation-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Variation Type Name*</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading.form}
                required
                placeholder="e.g., Isometric, Eccentric Focus, Resistance Band"
              />
              {validationErrors.name && (
                <div className="error-message">{validationErrors.name}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                disabled={isLoading.form}
                placeholder="Explain how this variation is performed or what makes it unique"
              ></textarea>
              {validationErrors.description && (
                <div className="error-message">{validationErrors.description}</div>
              )}
            </div>
            
            {errors?.form && (
              <div className="alert alert-danger">{errors.form}</div>
            )}
            
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading?.form}
              >
                {isLoading?.form ? 'Creating...' : 'Create Variation Type'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Existing Variation Types Section */}
        <div className="existing-variations-section">
          <h2>Current Variation Types</h2>
          <div className="variations-grid">
            {variationTypes.map(type => (
              <div key={type.id} className="variation-type-card">
                <h3>{type.name}</h3>
                
                {type.description && (
                  <div className="type-description">
                    <p>{type.description}</p>
                  </div>
                )}
                
                {/* Only allow deleting custom types, not default ones */}
                {!type.isDefault && (
                  <div className="variation-actions">
                    <button
                      onClick={() => handleDeleteVariationType(type.id)}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Filter controls for routine variations */}
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
                value={exerciseFilter}
                onChange={(e) => setExerciseFilter(e.target.value)}
              >
                <option value="">All Exercises</option>
                {exercises.map(exercise => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>
              
              <select
                className="filter-select"
                value={routineFilter}
                onChange={(e) => setRoutineFilter(e.target.value)}
              >
                <option value="">All Routines</option>
                {routines.map(routine => (
                  <option key={routine.id} value={routine.id}>
                    {routine.name} {routine.day_of_week ? `(${routine.day_of_week})` : ''}
                  </option>
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
                className="btn btn-secondary"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          {/* Variations List */}
          <div className="variations-list">
            {loading ? (
              <div className="loading">Loading variations...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : filteredVariations.length === 0 ? (
              <div className="no-variations">
                <p>No variations found{searchTerm || routineFilter || exerciseFilter || typeFilter ? ' matching your filters' : ''}.</p>
                {(searchTerm || routineFilter || exerciseFilter || typeFilter) && (
                  <button 
                    className="btn btn-link"
                    onClick={resetFilters}
                  >
                    Clear filters
                  </button>
                )}
                {!searchTerm && !routineFilter && !exerciseFilter && !typeFilter && (
                  <p>
                    No exercise variations found. You can add exercises to routines
                    from the Exercise Browser or when creating a routine.
                  </p>
                )}
              </div>
            ) : (
              <div className="variations-grid">
                {filteredVariations.map(variation => (
                  <div key={variation.id} className="variation-card">
                    <h3>{variation.name}</h3>
                    
                    <div className="variation-exercise">
                      <span>Exercise:</span> {variation.exercise_name}
                      {variation.exercise_muscle_group && (
                        <span className="muscle-badge">{variation.exercise_muscle_group}</span>
                      )}
                    </div>
                    
                    <div className="variation-type">
                      <span>Type:</span> {variation.variation_type || 'Standard'}
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
                        to={`/routines/${variation.routine_id}/exercises/${variation.id}/edit`} 
                        className="btn btn-secondary"
                      >
                        Edit
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