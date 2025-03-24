import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ExerciseList from '../components/Exercises/ExerciseList';
import '../styles/RoutineDetail.css';

const generateInstanceId = () => Math.random().toString(36).substr(2, 9);

const RoutineDetail = () => {
  const { routineId } = useParams();
  const navigate = useNavigate();
  
  const { 
    currentRoutine, 
    loadRoutineDetails,
    deleteRoutine, 
    deleteRoutineExercise,
    userDataLoading,
    routineLoading,
    error,
    isAuthenticated
  } = useAppContext();
  
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const instanceId = useMemo(() => generateInstanceId(), []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && hasFetched) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, hasFetched]);

  // Load routine details from the backend
  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const fetchRoutine = async () => {
      if (isAuthenticated && isMounted && !hasFetched) {
        console.log(`[${instanceId}] Fetching routine details for routineId:`, routineId);
        timeoutId = setTimeout(() => {
          if (isMounted) {
            console.log(`[${instanceId}] Loading timeout triggered after 10 seconds`);
            setLoadingTimeout(true);
          }
        }, 10000);

        try {
          const result = await loadRoutineDetails(routineId);
          console.log(`[${instanceId}] loadRoutineDetails result:`, result);
        } catch (err) {
          console.error(`[${instanceId}] Error in fetchRoutine:`, err);
        } finally {
          if (isMounted) {
            setHasFetched(true);
          }
        }
      }
    };

    fetchRoutine();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      console.log(`[${instanceId}] Cleanup: Cleared timeout for routineId:`, routineId);
    };
  }, [routineId, isAuthenticated, loadRoutineDetails, hasFetched, instanceId]);
  
  const handleDeleteRoutine = async () => {
    if (window.confirm(`Are you sure you want to delete "${currentRoutine?.name}"?`)) {
      setIsDeleting(true);
      try {
        const success = await deleteRoutine(routineId);
        if (success) {
          navigate('/');
        }
      } catch (err) {
        console.error('Error deleting routine:', err);
        setIsDeleting(false);
      }
    }
  };
  
  console.log(`[${instanceId}] Rendering RoutineDetail - userDataLoading:`, userDataLoading, 'routineLoading:', routineLoading, 'loadingTimeout:', loadingTimeout, 'error:', error);

  // Show loading state if either userDataLoading or routineLoading is true
  if (userDataLoading || routineLoading) {
    if (loadingTimeout) {
      return (
        <div className="routine-detail-container error">
          <div className="alert alert-danger">Loading took too long. Please try again.</div>
          <Link to="/" className="btn btn-link">
            Back to Dashboard
          </Link>
        </div>
      );
    }
    return <div className="routine-detail-container loading">Loading routine...</div>;
  }
  
  if (error) {
    return (
      <div className="routine-detail-container error">
        <div className="alert alert-danger">{error}</div>
        <Link to="/" className="btn btn-link">
          Back to Dashboard
        </Link>
      </div>
    );
  }
  
  if (!currentRoutine || currentRoutine.id !== parseInt(routineId)) {
    return (
      <div className="routine-detail-container error">
        <div className="alert alert-danger">Routine not found</div>
        <Link to="/" className="btn btn-link">
          Back to Dashboard
        </Link>
      </div>
    );
  }
  
  const { name, day_of_week, description, routine_exercises } = currentRoutine;
  
  // Sort exercises by order property if available
  const sortedExercises = routine_exercises 
    ? [...routine_exercises].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];
  
  return (
    <div className="routine-detail-container">
      <div className="routine-header">
        <h1>{name}</h1>
        {day_of_week && <span className="day-badge">{day_of_week}</span>}
      </div>
      
      <div className="routine-actions">
        <Link to={`/edit-routine/${routineId}`} className="btn btn-primary">
          Edit Routine
        </Link>
        <button 
          onClick={handleDeleteRoutine} 
          className="btn btn-danger"
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete Routine'}
        </button>
      </div>
      
      {description && (
        <div className="routine-description">
          <p>{description}</p>
        </div>
      )}
      
      <div className="routine-exercises">
        <div className="exercises-header">
          <h2>Exercises</h2>
        </div>
        
        {sortedExercises && sortedExercises.length > 0 ? (
          <div className="exercise-list">
            {sortedExercises.map((routineExercise) => (
              <div key={routineExercise.id} className="exercise-card">
                <h3 className="exercise-name">{routineExercise.exercise.name}</h3>
                <div className="exercise-details">
                  <div className="exercise-info">
                    <span className="exercise-muscle">{routineExercise.exercise.muscle_group}</span>
                    {routineExercise.exercise.equipment && (
                      <span className="exercise-equipment">
                        Equipment: {routineExercise.exercise.equipment}
                      </span>
                    )}
                  </div>
                  
                  <div className="exercise-metrics">
                    <div className="metric">
                      <span className="metric-label">Sets:</span> {routineExercise.sets}
                    </div>
                    <div className="metric">
                      <span className="metric-label">Reps:</span> {routineExercise.reps}
                    </div>
                    {routineExercise.weight && (
                      <div className="metric">
                        <span className="metric-label">Weight:</span> {routineExercise.weight} lbs
                      </div>
                    )}
                  </div>
                  
                  {routineExercise.notes && (
                    <div className="exercise-notes">
                      <span className="notes-label">Notes:</span> {routineExercise.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-exercises">
            <p>No exercises have been added to this routine yet.</p>
          </div>
        )}
      </div>
      
      <div className="routine-detail-footer">
        <Link to={`/edit-routine/${routineId}`} className="btn btn-secondary">
          Edit Exercises
        </Link>
        <Link to="/" className="btn btn-link">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default RoutineDetail;