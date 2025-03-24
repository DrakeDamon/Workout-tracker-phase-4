import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import '../../styles/RoutineCard.css';

const RoutineCard = ({ routine }) => {
  const { deleteRoutine, isLoading, getError } = useAppContext();
  
  // Use the isLoading.deletion helper to check if this specific routine is being deleted
  const isDeletingThisRoutine = isLoading.deletion(routine.id);
  const exerciseCount = routine.routine_exercises ? routine.routine_exercises.length : 0;

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${routine.name}"?`)) {
      try {
        await deleteRoutine(routine.id);
        // No need to set local state - the loading state is managed by the context
      } catch (error) {
        // Error handling is managed in the context, but we can add additional UI feedback here if needed
        console.error('Delete routine error caught in component:', error);
      }
    }
  };

  return (
    <div className="routine-card">
      <h3 className="routine-name">{routine.name}</h3>
      
      <div className="routine-details">
        <p className="routine-description">{routine.description}</p>
        <p className="exercise-count">{exerciseCount} exercises</p>
      </div>
      
      <div className="routine-actions">
        <Link to={`/routine/${routine.id}`} className="view-btn">
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