import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import '../../styles/ExerciseList.css';

const ExerciseList = ({ exercises, showControls = false }) => {
  const { deleteRoutineExercise, isLoading } = useAppContext();
  
  // Sort exercises by order if it exists
  const sortedExercises = [...exercises].sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleDeleteExercise = async (routineExerciseId) => {
    if (window.confirm('Are you sure you want to remove this exercise from the routine?')) {
      try {
        await deleteRoutineExercise(routineExerciseId);
      } catch (error) {
        console.error('Delete exercise error:', error);
      }
    }
  };

  return (
    <div className="exercise-list">
      {sortedExercises.map((routineExercise) => {
        const { 
          id, 
          exercise, 
          sets, 
          reps, 
          weight, 
          notes, 
          order 
        } = routineExercise;
        
        // Check if this specific exercise is being deleted
        const isDeleting = isLoading.deletion === id;
        
        return (
          <div key={id} className="exercise-item" data-order={order}>
            <div className="exercise-header">
              <h3>{exercise.name}</h3>
              
              {exercise.muscle_group && (
                <span className="muscle-badge">
                  {exercise.muscle_group}
                </span>
              )}
              
              {showControls && (
                <div className="exercise-controls">
                  <Link 
                    to={`/routines/${routineExercise.routine_id}/exercises/${id}/edit`} 
                    className="btn btn-small"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDeleteExercise(id)} 
                    className="btn btn-small btn-danger"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Removing...' : 'Remove'}
                  </button>
                </div>
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
            
            {exercise.equipment && (
              <div className="exercise-equipment">
                <span className="equipment-label">Equipment:</span>
                <span className="equipment-value">{exercise.equipment}</span>
              </div>
            )}
          </div>
        );
      })}
      
      {sortedExercises.length === 0 && (
        <div className="empty-exercises">
          <p>No exercises found for this routine.</p>
        </div>
      )}
    </div>
  );
};

export default ExerciseList;