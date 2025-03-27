import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import '../../styles/RoutineCard.css';

const RoutineCard = ({ routine }) => {
  const { deleteRoutine, isLoading } = useAppContext();
  
  // Check if this specific routine is being deleted
  const isDeletingThisRoutine = isLoading.deletion === routine.id;
  
  // Count exercises
  const exerciseCount = routine.routine_exercises ? routine.routine_exercises.length : 0;

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${routine.name}"?`)) {
      try {
        await deleteRoutine(routine.id);
        // No need to do anything else, the state will be updated by the context
      } catch (error) {
        console.error('Delete routine error:', error);
      }
    }
  };

  return (
    <div className="routine-card">
      <h3 className="routine-name">{routine.name}</h3>
      
      {routine.day_of_week && (
        <span className="day-badge">{routine.day_of_week}</span>
      )}
      
      <div className="routine-details">
        {routine.description && (
          <p className="routine-description">{routine.description}</p>
        )}
        <p className="exercise-count">{exerciseCount} exercises</p>
      </div>
      
      <div className="routine-actions">
        <Link to={`/routines/${routine.id}`} className="view-btn">
          View Details
        </Link>
        <button 
          onClick={handleDelete} 
          className="delete-btn"
          disabled={isDeletingThisRoutine}
        >
          {isDeletingThisRoutine ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export default RoutineCard;