import React from 'react';
import '../styles/ExerciseCard.css';

const ExerciseCard = ({ exercise, showActions = false, onAddClick }) => {
  return (
    <div className="exercise-card">
      <div className="exercise-card-header">
        <h3 className="exercise-title">{exercise.name}</h3>
        
        {exercise.muscle_group && (
          <span className="muscle-group-badge">{exercise.muscle_group}</span>
        )}
      </div>
      
      {exercise.equipment && (
        <div className="exercise-equipment">
          <span className="label">Equipment:</span> {exercise.equipment}
        </div>
      )}
      
      {exercise.description && (
        <div className="exercise-description">
          <p>{exercise.description.substring(0, 150)}
            {exercise.description.length > 150 ? '...' : ''}
          </p>
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