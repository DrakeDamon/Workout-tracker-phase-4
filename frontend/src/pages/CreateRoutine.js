import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useAppContext } from '../context/AppContext';
import '../styles/RoutineForm.css';

const RoutineSchema = Yup.object().shape({
  name: Yup.string()
    .required('Routine name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters'),
  day_of_week: Yup.string(),
  description: Yup.string().max(500, 'Description must be less than 500 characters'),
  exercises: Yup.array().of(
    Yup.object().shape({
      exercise_id: Yup.number().required('Exercise is required'),
      sets: Yup.number().min(1, 'Sets must be at least 1').required('Sets are required'),
      reps: Yup.number().min(1, 'Reps must be at least 1').required('Reps are required'),
      weight: Yup.number().min(0, 'Weight cannot be negative'),
      duration: Yup.number().min(0, 'Duration cannot be negative'),
      rest: Yup.number().min(0, 'Rest cannot be negative')
    })
  )
});

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
  'Friday', 'Saturday', 'Sunday'
];

const CreateRoutine = () => {
  const navigate = useNavigate();
  const { 
    createRoutine, 
    addExerciseToRoutine, 
    exercises, 
    isLoading,
    errors,
    clearError,
    isAuthenticated,
    handleFormSubmission
  } = useAppContext();
  
  // Get specific loading and error states
  const isUserDataLoading = isLoading.userData;
  const isSubmitting = isLoading.submission;
  const formError = errors.form;
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Clear form errors when component unmounts
  useEffect(() => {
    return () => clearError('form');
  }, [clearError]);
  
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Step 1: Create the routine
      const routineData = {
        name: values.name,
        day_of_week: values.day_of_week,
        description: values.description
      };
      
      const newRoutine = await createRoutine(routineData);
      
      if (!newRoutine) {
        throw new Error('Failed to create routine');
      }
  
      // Step 2: Add exercises to the routine
      if (values.exercises && values.exercises.length > 0) {
        for (const exercise of values.exercises) {
          const exerciseData = {
            exercise_id: parseInt(exercise.exercise_id, 10),
            sets: parseInt(exercise.sets, 10),
            reps: parseInt(exercise.reps, 10),
            weight: exercise.weight ? parseFloat(exercise.weight) : null,
            duration: exercise.duration ? parseInt(exercise.duration, 10) : null,
            rest: exercise.rest ? parseInt(exercise.rest, 10) : null
          };
          await addExerciseToRoutine(newRoutine.id, exerciseData);
        }
      }
  
      // Reset form
      resetForm();
      
      // Direct navigation using window.location instead of React Router
      // This is a more forceful approach but should work in all cases
      window.location.href = '/';
      
    } catch (err) {
      console.error('Form submission error:', err);
      alert('There was an error creating your routine. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Show loading state only for initial data loading
  if (isUserDataLoading) {
    return <div className="routine-form-container loading">Loading...</div>;
  }
  
  return (
    <div className="routine-form-container">
      <h1>Add Workout Routine</h1>
      
      <Formik
        initialValues={{
          name: '',
          day_of_week: '',
          description: '',
          exercises: []
        }}
        validationSchema={RoutineSchema}
        onSubmit={handleSubmit}
      >
        {({ values }) => (
          <Form className="routine-form">
            <div className="form-group">
              <label htmlFor="name">Routine Name*</label>
              <Field 
                type="text" 
                name="name" 
                id="name" 
                className="form-control"
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              <ErrorMessage name="description" component="div" className="error-message" />
            </div>

            <div className="exercises-section">
              <h2>Exercises</h2>
              <FieldArray name="exercises">
                {({ push, remove }) => (
                  <div>
                    {values.exercises.map((_, index) => (
                      <div key={index} className="exercise-entry">
                        <div className="form-group">
                          <label htmlFor={`exercises[${index}].exercise_id`}>Exercise*</label>
                          <Field 
                            as="select" 
                            name={`exercises[${index}].exercise_id`} 
                            className="form-control"
                            disabled={isSubmitting}
                          >
                            <option value="">Select an exercise</option>
                            {exercises.map(exercise => (
                              <option key={exercise.id} value={exercise.id}>
                                {exercise.name}
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage name={`exercises[${index}].exercise_id`} component="div" className="error-message" />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`exercises[${index}].sets`}>Sets*</label>
                          <Field 
                            type="number" 
                            name={`exercises[${index}].sets`} 
                            className="form-control"
                            disabled={isSubmitting}
                          />
                          <ErrorMessage name={`exercises[${index}].sets`} component="div" className="error-message" />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`exercises[${index}].reps`}>Reps*</label>
                          <Field 
                            type="number" 
                            name={`exercises[${index}].reps`} 
                            className="form-control"
                            disabled={isSubmitting}
                          />
                          <ErrorMessage name={`exercises[${index}].reps`} component="div" className="error-message" />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`exercises[${index}].weight`}>Weight (kg, optional)</label>
                          <Field 
                            type="number" 
                            name={`exercises[${index}].weight`} 
                            className="form-control"
                            disabled={isSubmitting}
                          />
                          <ErrorMessage name={`exercises[${index}].weight`} component="div" className="error-message" />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`exercises[${index}].duration`}>Duration (seconds, optional)</label>
                          <Field 
                            type="number" 
                            name={`exercises[${index}].duration`} 
                            className="form-control"
                            disabled={isSubmitting}
                          />
                          <ErrorMessage name={`exercises[${index}].duration`} component="div" className="error-message" />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`exercises[${index}].rest`}>Rest (seconds, optional)</label>
                          <Field 
                            type="number" 
                            name={`exercises[${index}].rest`} 
                            className="form-control"
                            disabled={isSubmitting}
                          />
                          <ErrorMessage name={`exercises[${index}].rest`} component="div" className="error-message" />
                        </div>

                        <button 
                          type="button" 
                          onClick={() => remove(index)} 
                          className="btn btn-danger"
                          disabled={isSubmitting}
                        >
                          Remove Exercise
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={() => push({ exercise_id: '', sets: '', reps: '', weight: '', duration: '', rest: '' })} 
                      className="btn btn-secondary"
                      disabled={isSubmitting}
                    >
                      Add Exercise
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>
            
            {formError && (
              <div className="alert alert-danger">{formError}</div>
            )}
            
            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => window.location.href = '/' } 
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Create Routine'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateRoutine;