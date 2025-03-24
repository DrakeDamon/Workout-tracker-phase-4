import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAppContext } from '../context/AppContext';
import '../styles/RoutineForm.css';

const RoutineSchema = Yup.object().shape({
  name: Yup.string()
    .required('Routine name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters'),
  day_of_week: Yup.string(),
  description: Yup.string().max(500, 'Description must be less than 500 characters')
});

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
  'Friday', 'Saturday', 'Sunday'
];

const EditRoutine = () => {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const { 
    currentRoutine,
    loadRoutineDetails,
    updateRoutine, 
    deleteRoutineExercise,
    updateRoutineExercise,
    isLoading,
    errors,
    clearError,
    isAuthenticated,
    activeEdits,
    setActiveExerciseEdit,
    handleFormSubmission
  } = useAppContext();
  
  // Get specific loading and error states
  const isUserDataLoading = isLoading.userData;
  const isRoutineLoading = isLoading.routine;
  const isSubmitting = isLoading.submission;
  const formError = errors.form;
  const routineError = errors.routine;
  
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Load routine details from the backend
  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const fetchRoutine = async () => {
      if (isAuthenticated && isMounted) {
        timeoutId = setTimeout(() => {
          if (isMounted) {
            setLoadingTimeout(true);
          }
        }, 10000);

        try {
          await loadRoutineDetails(routineId);
        } catch (err) {
          console.error('Error in fetchRoutine:', err);
        }
      }
    };

    fetchRoutine();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      // Clear form errors when component unmounts
      clearError('form');
    };
  }, [routineId, isAuthenticated, loadRoutineDetails, clearError]);
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      console.log('Starting routine update process...');
      console.log('Updating routine with data:', values);
      
      // Update the routine using direct API call
      const updatedRoutine = await updateRoutine(routineId, values);
      
      if (!updatedRoutine) {
        console.error('No routine returned from updateRoutine');
        throw new Error('Failed to update routine');
      }
      
      console.log('Routine updated successfully:', updatedRoutine);
      
      // Use direct window.location navigation to ensure it works
      window.location.href = `/routine/${routineId}`;
    } catch (err) {
      console.error('Form submission error:', err);
      alert('There was an error updating your routine. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExercise = async (routineExerciseId) => {
    if (window.confirm('Are you sure you want to remove this exercise from the routine?')) {
      try {
        await deleteRoutineExercise(routineExerciseId);
      } catch (err) {
        console.error('Delete exercise error caught in component:', err);
      }
    }
  };

  const handleSaveExerciseChanges = async (routineExerciseId, updates) => {
    try {
      await updateRoutineExercise(routineExerciseId, updates);
      setActiveExerciseEdit(null);
    } catch (err) {
      console.error('Update exercise error caught in component:', err);
    }
  };
  
  // Show appropriate loading state, error, or timeout message
  if (isUserDataLoading || isRoutineLoading) {
    if (loadingTimeout) {
      return (
        <div className="routine-form-container error">
          <div className="alert alert-danger">Loading took too long. Please try again.</div>
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      );
    }
    return <div className="routine-form-container loading">Loading...</div>;
  }
  
  if (!currentRoutine || (currentRoutine.id !== parseInt(routineId, 10))) {
    return (
      <div className="routine-form-container error">
        <div className="alert alert-danger">{formError || routineError || 'Routine not found'}</div>
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Sort exercises by order if available
  const sortedExercises = currentRoutine.routine_exercises 
    ? [...currentRoutine.routine_exercises].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];
  
  return (
    <div className="routine-form-container">
      <h1>Edit Workout Routine</h1>
      
      <Formik
        initialValues={{
          name: currentRoutine.name || '',
          day_of_week: currentRoutine.day_of_week || '',
          description: currentRoutine.description || ''
        }}
        validationSchema={RoutineSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting: formikSubmitting }) => (
          <Form className="routine-form">
            <div className="form-group">
              <label htmlFor="name">Routine Name*</label>
              <Field 
                type="text" 
                name="name" 
                id="name" 
                className="form-control"
                disabled={isSubmitting || formikSubmitting}
              />
              <ErrorMessage name="name" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="day_of_week">Day of Week</label>
              <Field 
                as="select" 
                name="day_of_week" 
                id="day_of_week" 
                className="form-control"
                disabled={isSubmitting || formikSubmitting}
              >
                <option value="">Select a day (optional)</option>
                {daysOfWeek.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </Field>
              <ErrorMessage name="day_of_week" component="div" className="error-message" />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <Field 
                as="textarea" 
                name="description" 
                id="description" 
                className="form-control"
                rows="4"
                disabled={isSubmitting || formikSubmitting}
              />
              <ErrorMessage name="description" component="div" className="error-message" />
            </div>
            
            {formError && (
              <div className="alert alert-danger">{formError}</div>
            )}
            
            <div className="exercises-section">
              <h2>Exercises</h2>
              
              {sortedExercises.length === 0 ? (
                <div className="no-exercises">
                  <p>No exercises in this routine yet.</p>
                </div>
              ) : (
                <div className="exercise-list">
                  {sortedExercises.map((routineExercise) => (
                    <div key={routineExercise.id} className="exercise-item">
                      {activeEdits.exerciseId === routineExercise.id ? (
                        <div className="exercise-edit-form">
                          <h3>{routineExercise.exercise.name}</h3>
                          <div className="exercise-form-groups">
                            <div className="form-group small">
                              <label>Sets</label>
                              <input 
                                type="number" 
                                className="form-control"
                                min="1"
                                defaultValue={routineExercise.sets} 
                                id={`sets-${routineExercise.id}`}
                              />
                            </div>
                            <div className="form-group small">
                              <label>Reps</label>
                              <input 
                                type="number" 
                                className="form-control"
                                min="1"
                                defaultValue={routineExercise.reps} 
                                id={`reps-${routineExercise.id}`}
                              />
                            </div>
                            <div className="form-group small">
                              <label>Weight (lbs)</label>
                              <input 
                                type="number" 
                                className="form-control"
                                min="0"
                                step="0.5"
                                defaultValue={routineExercise.weight} 
                                id={`weight-${routineExercise.id}`}
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Notes</label>
                            <textarea 
                              className="form-control"
                              rows="2"
                              defaultValue={routineExercise.notes} 
                              id={`notes-${routineExercise.id}`}
                            />
                          </div>
                          <div className="exercise-edit-actions">
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setActiveExerciseEdit(null)}
                              disabled={isLoading.exerciseUpdate(routineExercise.id)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              disabled={isLoading.exerciseUpdate(routineExercise.id)}
                              onClick={() => {
                                const updates = {
                                  sets: parseInt(document.getElementById(`sets-${routineExercise.id}`).value, 10),
                                  reps: parseInt(document.getElementById(`reps-${routineExercise.id}`).value, 10),
                                  weight: document.getElementById(`weight-${routineExercise.id}`).value ? 
                                    parseFloat(document.getElementById(`weight-${routineExercise.id}`).value) : null,
                                  notes: document.getElementById(`notes-${routineExercise.id}`).value
                                };
                                handleSaveExerciseChanges(routineExercise.id, updates);
                              }}
                            >
                              {isLoading.exerciseUpdate(routineExercise.id) ? 'Saving...' : 'Save Exercise'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="exercise-display">
                          <div className="exercise-header">
                            <h3>{routineExercise.exercise.name}</h3>
                            <div className="exercise-actions">
                              <button 
                                type="button" 
                                className="btn btn-sm btn-secondary"
                                onClick={() => setActiveExerciseEdit(routineExercise.id)}
                                disabled={isLoading.exerciseUpdate(routineExercise.id)}
                              >
                                Edit
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteExercise(routineExercise.id)}
                                disabled={isLoading.exerciseUpdate(routineExercise.id)}
                              >
                                {isLoading.exerciseUpdate(routineExercise.id) ? 'Removing...' : 'Remove'}
                              </button>
                            </div>
                          </div>
                          <div className="exercise-info">
                            <div className="exercise-muscle">
                              {routineExercise.exercise.muscle_group}
                            </div>
                            <div className="exercise-metrics">
                              <span><strong>Sets:</strong> {routineExercise.sets}</span>
                              <span><strong>Reps:</strong> {routineExercise.reps}</span>
                              {routineExercise.weight && (
                                <span><strong>Weight:</strong> {routineExercise.weight} lbs</span>
                              )}
                            </div>
                            {routineExercise.notes && (
                              <div className="exercise-notes">
                                <strong>Notes:</strong> {routineExercise.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="add-exercise-section">
                <Link 
                  to={`/add-exercise/${routineId}`} 
                  className="btn btn-primary add-exercise-btn"
                >
                  Add Exercise
                </Link>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => window.location.href = '/'} 
                className="btn btn-secondary"
                disabled={isSubmitting || formikSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSubmitting || formikSubmitting}
              >
                {isSubmitting || formikSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EditRoutine;