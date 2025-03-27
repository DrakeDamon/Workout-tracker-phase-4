import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Navbar from '../components/Layout/Navbar';
import '../styles/ExerciseBrowser.css';

const ExerciseBrowser = () => {
  const { exercises, muscleGroups, equipment, isLoading, createExercise } = useAppContext();
  const navigate = useNavigate();
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    muscle_group: '',
    equipment: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filtered exercises
  const [filteredExercises, setFilteredExercises] = useState([]);
  
  // Effect to filter exercises when filters or exercises change
  useEffect(() => {
    if (!exercises) return;
    
    let result = [...exercises];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(exercise => 
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply muscle group filter
    if (muscleGroupFilter) {
      result = result.filter(exercise => 
        exercise.muscle_group === muscleGroupFilter
      );
    }
    
    // Apply equipment filter
    if (equipmentFilter) {
      result = result.filter(exercise => 
        exercise.equipment === equipmentFilter
      );
    }
    
    setFilteredExercises(result);
  }, [exercises, searchTerm, muscleGroupFilter, equipmentFilter]);
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setMuscleGroupFilter('');
    setEquipmentFilter('');
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Validate form
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
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This is the key function that posts the data to the backend
      const newExercise = await createExercise(formData);
      
      if (newExercise) {
        console.log('New exercise created:', newExercise);
        
        // Reset form data
        setFormData({
          name: '',
          description: '',
          muscle_group: '',
          equipment: ''
        });
        
        // Add the new exercise to the filtered list if it matches current filters
        let shouldAddToFiltered = true;
        
        if (muscleGroupFilter && newExercise.muscle_group !== muscleGroupFilter) {
          shouldAddToFiltered = false;
        }
        
        if (equipmentFilter && newExercise.equipment !== equipmentFilter) {
          shouldAddToFiltered = false;
        }
        
        if (searchTerm && !newExercise.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          shouldAddToFiltered = false;
        }
        
        // Only update local state if the new exercise matches current filters
        if (shouldAddToFiltered) {
          setFilteredExercises(prev => [...prev, newExercise]);
        }
        
        // Success message
        alert('Exercise created successfully!');
      }
    } catch (error) {
      console.error('Error creating exercise:', error);
      setFormErrors({
        form: 'Failed to create exercise. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
          
          <select 
            className="filter-select"
            value={muscleGroupFilter}
            onChange={(e) => setMuscleGroupFilter(e.target.value)}
          >
            <option value="">All Muscle Groups</option>
            {muscleGroups && muscleGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
          
          <select 
            className="filter-select"
            value={equipmentFilter}
            onChange={(e) => setEquipmentFilter(e.target.value)}
          >
            <option value="">All Equipment</option>
            {equipment && equipment.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          
          <button 
            className="btn btn-secondary"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
        
        {/* Create Exercise Form */}
        <div className="exercise-form-container">
          <h2>Create New Exercise</h2>
          
          {formErrors.form && (
            <div className="alert alert-danger">{formErrors.form}</div>
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
                disabled={isSubmitting}
              />
              {formErrors.name && <div className="error-message">{formErrors.name}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="muscle_group">Muscle Group</label>
              <select
                id="muscle_group"
                name="muscle_group"
                className="form-control"
                value={formData.muscle_group}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">Select Muscle Group</option>
                {muscleGroups && muscleGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
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
                disabled={isSubmitting}
              >
                <option value="">Select Equipment</option>
                {equipment && equipment.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
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
                disabled={isSubmitting}
              />
              {formErrors.description && <div className="error-message">{formErrors.description}</div>}
            </div>
            
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Exercise'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="exercise-results">
          {isLoading.userData ? (
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
                  
                  {exercise.muscle_group && (
                    <div className="exercise-muscle">{exercise.muscle_group}</div>
                  )}
                  
                  {exercise.equipment && (
                    <div className="exercise-equipment">
                      <span>Equipment:</span> {exercise.equipment}
                    </div>
                  )}
                  
                  {exercise.description && (
                    <div className="exercise-description">
                      <p>{exercise.description.substring(0, 100)}
                        {exercise.description.length > 100 ? '...' : ''}
                      </p>
                    </div>
                  )}
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