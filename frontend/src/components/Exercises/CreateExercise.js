// frontend/src/pages/CreateExercise.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import '../styles/ExerciseForm.css';

const muscleGroups = [
  'Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core', 'Full Body'
];

const equipmentTypes = [
  'None', 'Dumbbells', 'Barbell', 'Machine', 'Cable Machine', 
  'Resistance Bands', 'Kettlebell', 'Medicine Ball', 'Bodyweight', 'Other'
];

const CreateExercise = () => {
  const navigate = useNavigate();
  const { isAuthenticated, createExercise, isLoading, errors, clearError } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    muscle_group: '',
    equipment: ''
  });
  
  // Get specific loading and error states
  const isSubmitting = isLoading.submission;
  const formError = errors.form;
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    
    // Clear form errors when component unmounts
    return () => clearError('form');
  }, [isAuthenticated, navigate, clearError]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create the exercise using the context method
      await createExercise(formData);
      
      // Navigate to exercise browser on success
      navigate('/exercise-browser');
    } catch (error) {
      console.error('Error creating exercise:', error);
      // Error handling is done by the context
    }
  };
  
  return (
    <div className="exercise-form-container">
      <h1>Create New Exercise</h1>
      
      <form onSubmit={handleSubmit} className="exercise-form">
        <div className="form-group">
          <label htmlFor="name">Exercise Name*</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            disabled={isSubmitting}
            placeholder="e.g., Bench Press"
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="muscle_group">Primary Muscle Group*</label>
          <select 
            id="muscle_group" 
            name="muscle_group" 
            value={formData.muscle_group} 
            onChange={handleChange} 
            required 
            disabled={isSubmitting}
            className="form-control"
          >
            <option value="">Select a muscle group</option>
            {muscleGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="equipment">Equipment</label>
          <select 
            id="equipment" 
            name="equipment" 
            value={formData.equipment} 
            onChange={handleChange} 
            disabled={isSubmitting}
            className="form-control"
          >
            <option value="">Select equipment type</option>
            {equipmentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea 
            id="description" 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            disabled={isSubmitting}
            placeholder="Describe how to perform this exercise..."
            className="form-control"
            rows="4"
          />
        </div>
        
        {formError && (
          <div className="alert alert-danger">{formError}</div>
        )}
        
        <div className="form-actions">
          <Link to="/exercise-browser" className="btn btn-secondary">
            Cancel
          </Link>
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
  );
};

export default CreateExercise;