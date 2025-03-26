import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useAppContext } from '../context/AppContext';
import Navbar from '../components/Layout/Navbar';
import '../styles/RoutineForm.css';

// Validation schema
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
      sets: Yup.number()
        .min(1, 'Sets must be at least 1')
        .required('Sets are required'),
      reps: Yup.number()
        .min(1, 'Reps must be at least 1')
        .required('Reps are required'),
      weight: Yup.number()
        .nullable()
        .min(0, 'Weight cannot be negative'),
      notes: Yup.string()
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
    errors
  } = useAppContext();
  
  const handleSubmit = async (values, { setSubmitting }) => {
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
      
      // Step 2: Add exercises to the routine (if any)
      if (values.exercises && values.exercises.length > 0) {
        for (const exercise of values.exercises) {
          const exerciseData = {
            exercise_id: parseInt(exercise.exercise_id, 10),
            sets: parseInt(exercise.sets, 10),
            reps: parseInt(exercise.reps, 10),
            weight: exercise.weight ? parseFloat(exercise.weight) : null,
            notes: exercise.notes || null
          };
          
          await addExerciseToRoutine(newRoutine.id, exerciseData);
        }
      }
      
      // Step 3: Navigate to the new routine
      navigate(`/routines/${newRoutine.id}`);
    } catch (err) {
      console.error('Form submission error:', err);
      // Errors will be handled by the context and shown in the UI
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="app-container">
      <Navbar />
      
      <div className="routine-form-container">
        <h1>Create New Workout Routine</h1>
        
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
          {({ values, isSubmitting }) => (
            <Form className="routine-form">
              <div className="form-group">
                <label htmlFor="name">Routine Name*</label>
                <Field 
                  type="text" 
                  name="name" 
                  id="name" 
                  className="form-control"
                  disabled={isSubmitting || isLoading.form}
                />
                <ErrorMessage name="name" component="div" className="field-error" />
              </div>
              
              <div className="form-group">
                <label htmlFor="day_of_week">Day of Week</label>
                <Field 
                  as="select" 
                  name="day_of_week" 
                  id="day_of_week" 
                  className="form-control"
                  disabled={isSubmitting || isLoading.form}
                >
                  <option value="">Select a day (optional)</option>
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </Field>
                <ErrorMessage name="day_of_week" component="div" className="field-error" />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <Field 
                  as="textarea" 
                  name="description" 
                  id="description" 
                  className="form-control"
                  rows="4"
                  disabled={isSubmitting || isLoading.form}
                />
                <ErrorMessage name="description" component="div" className="field-error" />
              </div>
              
              <div className="exercises-section">
                <h2>Exercises</h2>
                <FieldArray name="exercises">
                  {({ push, remove }) => (
                    <div>
                      {values.exercises.map((_, index) => (
                        <div key={index} className="exercise-entry">
                          <h3>Exercise #{index + 1}</h3>
                          
                          <div className="form-group">
                            <label htmlFor={`exercises[${index}].exercise_id`}>Exercise*</label>
                            <Field 
                              as="select" 
                              name={`exercises[${index}].exercise_id`} 
                              className="form-control"
                              disabled={isSubmitting || isLoading.form}
                            >
                              <option value="">Select an exercise</option>
                              {exercises.map(exercise => (
                                <option key={exercise.id} value={exercise.id}>
                                  {exercise.name} ({exercise.muscle_group})
                                </option>
                              ))}
                            </Field>
                            <ErrorMessage 
                              name={`exercises[${index}].exercise_id`} 
                              component="div" 
                              className="field-error" 
                            />
                          </div>
                          
                          <div className="form-row">
                            <div className="form-group half">
                              <label htmlFor={`exercises[${index}].sets`}>Sets*</label>
                              <Field 
                                type="number" 
                                name={`exercises[${index}].sets`} 
                                className="form-control"
                                disabled={isSubmitting || isLoading.form}
                              />
                              <ErrorMessage 
                                name={`exercises[${index}].sets`} 
                                component="div" 
                                className="field-error" 
                              />
                            </div>
                            
                            <div className="form-group half">
                              <label htmlFor={`exercises[${index}].reps`}>Reps*</label>
                              <Field 
                                type="number" 
                                name={`exercises[${index}].reps`} 
                                className="form-control"
                                disabled={isSubmitting || isLoading.form}
                              />
                              <ErrorMessage 
                                name={`exercises[${index}].reps`} 
                                component="div" 
                                className="field-error" 
                              />
                            </div>
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor={`exercises[${index}].weight`}>Weight (optional)</label>
                            <Field 
                              type="number" 
                              name={`exercises[${index}].weight`} 
                              className="form-control"
                              disabled={isSubmitting || isLoading.form}
                              step="0.5"
                            />
                            <ErrorMessage 
                              name={`exercises[${index}].weight`} 
                              component="div" 
                              className="field-error" 
                            />
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor={`exercises[${index}].notes`}>Notes (optional)</label>
                            <Field 
                              as="textarea"
                              name={`exercises[${index}].notes`} 
                              className="form-control"
                              rows="2"
                              disabled={isSubmitting || isLoading.form}
                            />
                          </div>
                          
                          <button 
                            type="button" 
                            onClick={() => remove(index)} 
                            className="btn btn-danger"
                            disabled={isSubmitting || isLoading.form}
                          >
                            Remove Exercise
                          </button>
                        </div>
                      ))}
                      
                      <button 
                        type="button" 
                        onClick={() => push({ 
                          exercise_id: '', 
                          sets: 3, 
                          reps: 10, 
                          weight: '', 
                          notes: '' 
                        })} 
                        className="btn btn-secondary"
                        disabled={isSubmitting || isLoading.form}
                      >
                        Add Exercise
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>
              
              {errors.form && (
                <div className="form-error">{errors.form}</div>
              )}
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => navigate('/')} 
                  className="btn btn-secondary"
                  disabled={isSubmitting || isLoading.form}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting || isLoading.form}
                >
                  {isSubmitting || isLoading.form ? 'Creating...' : 'Create Routine'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateRoutine;