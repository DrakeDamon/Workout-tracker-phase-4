import React from 'react';
import '../../styles/ExerciseCard.css';

const ExerciseCard = ({ exercise, variations = [], showActions = false, onAddClick }) => {
  return (
    <div className="exercise-card">
      <div className="exercise-card-header">
        <h3 className="exercise-title">{exercise.name}</h3>
      </div>
      
      {exercise.description && (
        <div className="exercise-description">
          <p>
            {exercise.description.substring(0, 150)}
            {exercise.description.length > 150 ? '...' : ''}
          </p>
        </div>
      )}
      
      {/* Display variations */}
      {variations.length > 0 && (
        <div className="exercise-variations">
          <h4>Variations:</h4>
          <ul>
            {variations.map(variation => (
              <li key={variation.id}>
                <strong>{variation.variation_type}</strong> - {variation.name}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {showActions && onAddClick && (
        <div className="exercise-actions">
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onAddClick(exercise)}
          >
            Add to Routine
          </button>
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;