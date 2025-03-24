import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/ExerciseList.css';
//test
const ExerciseList = ({ exercises, onDelete, showEditControls = false, routineId = null }) => {
  // Sort exercises by order property if it exists
  const sortedExercises = [...exercises].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    return 0;
  });

  return (
    <div className="exercise-list">
      {sortedExercises.map((routineExercise) => {
        const { id, exercise, sets, reps, weight, notes, order } = routineExercise;
        
        return (
          <div key={id} className="exercise-item" data-order={order}>
            <div className="exercise-header">
              <h3>{exercise.name}</h3>
              {exercise.muscle_group && (
                <span className="muscle-badge">
                  {exercise.muscle_group}
                </span>
              )}
            </div>
            
            <div className="exercise-details">
              <div className="detail-item">
                <span className="detail-label">Sets:</span>
                <span className="detail-value">{sets}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Reps:</span>
                <span className="detail-value">{reps}</span>
              </div>
              
              {weight && (
                <div className="detail-item">
                  <span className="detail-label">Weight:</span>
                  <span className="detail-value">{weight} lbs</span>
                </div>
              )}
            </div>
            
            {notes && (
              <div className="exercise-notes">
                <p>{notes}</p>
              </div>
            )}
            
            {showEditControls && routineId && (
              <div className="exercise-actions">
                <Link 
                  to={`/routines/${routineId}/exercises/${id}/edit`} 
                  className="btn btn-secondary btn-sm"
                >
                  Edit
                </Link>
                <button 
                  onClick={() => onDelete(id)} 
                  className="btn btn-danger btn-sm"
                >
                  Remove
                </button>
              </div>
            )}
            
            {exercise.equipment && (
              <div className="exercise-equipment">
                <span className="equipment-label">Equipment:</span>
                <span className="equipment-value">{exercise.equipment}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ExerciseList;