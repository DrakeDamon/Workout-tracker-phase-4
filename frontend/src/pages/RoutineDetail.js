import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Navbar from '../components/Layout/Navbar';
import ExerciseList from '../components/exercises/ExerciseList';
import '../styles/RoutineDetail.css';

const RoutineDetail = () => {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const { 
    loadRoutineDetails, 
    currentRoutine, 
    deleteRoutine, 
    isLoading, 
    errors 
  } = useAppContext();
  
  // Confirmation state for delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Load routine details on component mount
  useEffect(() => {
    loadRoutineDetails(routineId);
  }, [routineId, loadRoutineDetails]);
  
  // Handle routine deletion
  const handleDeleteRoutine = async () => {
    const success = await deleteRoutine(routineId);
    if (success) {
      navigate('/');
    }
  };
  
  if (isLoading.routine) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="routine-detail-container loading">
          Loading routine details...
        </div>
      </div>
    );
  }
  
  if (errors.routine) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="routine-detail-container error">
          <div className="alert alert-danger">
            {errors.routine}
          </div>
          <Link to="/" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  if (!currentRoutine) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="routine-detail-container error">
          <h2>Routine Not Found</h2>
          <p>The routine you're looking for doesn't exist or was deleted.</p>
          <Link to="/" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="app-container">
      <Navbar />
      
      <div className="routine-detail-container">
        <div className="routine-header">
          <h1>{currentRoutine.name}</h1>
          {currentRoutine.day_of_week && (
            <span className="day-badge">{currentRoutine.day_of_week}</span>
          )}
        </div>
        
        <div className="routine-actions">
          <Link 
            to={`/routines/${routineId}/edit`} 
            className="btn btn-primary"
          >
            Edit Routine
          </Link>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/routines/create')}
          >
            Create New Routine
          </button>
          <button 
            className="btn btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isLoading.deletion}
          >
            {isLoading.deletion ? 'Deleting...' : 'Delete Routine'}
          </button>
        </div>
        
        {showDeleteConfirm && (
          <div className="delete-confirmation">
            <p>Are you sure you want to delete this routine?</p>
            <div className="confirmation-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteRoutine}
              >
                Delete
              </button>
            </div>
          </div>
        )}
        
        {currentRoutine.description && (
          <div className="routine-description">
            <p>{currentRoutine.description}</p>
          </div>
        )}
        
        <div className="routine-exercises">
          <div className="exercises-header">
            <h2>Exercises</h2>
          </div>
          
          {currentRoutine.routine_exercises && currentRoutine.routine_exercises.length > 0 ? (
            <ExerciseList 
              exercises={currentRoutine.routine_exercises} 
              showControls={true}
            />
          ) : (
            <div className="no-exercises">
              <p>No exercises added to this routine yet.</p>
              <Link 
                to={`/routines/${routineId}/edit`} 
                className="btn btn-link"
              >
                Add exercises
              </Link>
            </div>
          )}
        </div>
        
        <div className="routine-detail-footer">
          <Link to="/" className="btn btn-link">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoutineDetail;