import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Navbar from '../components/Layout/Navbar';
import '../styles/ExerciseBrowser.css';

const ExerciseBrowser = () => {
  const { exercises, muscleGroups, equipment, isLoading } = useAppContext();
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  
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
        
        <div className="add-options">
          <Link to="/exercises/create" className="btn btn-primary">
            Create New Exercise
          </Link>
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