import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Navbar from '../components/Layout/Navbar';
import '../styles/CreateExercise.css';

const CreateExercise = () => {
  const navigate = useNavigate();
  const { createExercise, muscleGroups, equipment, isLoading, errors } = useAppContext();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    muscle_group: '',
    equipment: ''
  });
  
  // Form validation errors
  const [validationErrors, setValidationErrors] = useState({});
  
  // Handle input changes
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
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Exercise name is required';
    } else if (formData.name.length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const newExercise = await createExercise(formData);
      
      if (newExercise) {
        navigate('/exercises');
      }
    } catch (error) {
      console.error('Error creating exercise:', error);
    }
  };
  
  return (
    <div className="app-container">
      <Navbar />
      
      <div className="exercise-form-container">
        <h1>Create New Exercise</h1>
        
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
            />
            {validationErrors.name && (
              <div className="error-message">{validationErrors.name}</div>
            )}
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
              <option value="">Select a muscle group</option>
              {muscleGroups && muscleGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
              <option value="other">Other</option>
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
              <option value="">Select equipment</option>
              {equipment && equipment.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
              <option value="None">None (Bodyweight)</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              disabled={isLoading.form}
            ></textarea>
          </div>
          
          {errors.form && (
            <div className="alert alert-danger">{errors.form}</div>
          )}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/exercises')}
              disabled={isLoading.form}
            >
              Cancel
            </button>
            
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
    </div>
  );
};

export default CreateExercise;