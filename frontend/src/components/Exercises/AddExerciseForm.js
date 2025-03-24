import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

const AddExerciseForm = ({ routineId, onSuccess }) => {
  const navigate = useNavigate();
  
  // Define validation schema using Yup
  const validationSchema = Yup.object({
    exerciseId: Yup.number()
      .required('Please select an exercise'),
    sets: Yup.number()
      .required('Sets are required')
      .min(1, 'Must be at least 1 set')
      .max(20, 'Maximum 20 sets allowed'),
    reps: Yup.number()
      .required('Reps are required')
      .min(1, 'Must be at least 1 rep')
      .max(100, 'Maximum 100 reps allowed'),
    weight: Yup.number()
      .nullable()
      .transform((value) => (isNaN(value) ? null : value))
      .typeError('Weight must be a number'),
    notes: Yup.string()
      .max(200, 'Notes must be 200 characters or less')
  });

  // Initial form values
  const initialValues = {
    exerciseId: '',
    sets: 3,
    reps: 10,
    weight: '',
    notes: ''
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await fetch(`/api/routines/${routineId}/exercises`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to add exercise to routine');
      }

      resetForm();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding exercise to routine:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-exercise-form">
      <h2>Add Exercise to Routine</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form>
            <div className="form-group">
              <label htmlFor="exerciseId">Exercise</label>
              <Field 
                as="select" 
                name="exerciseId" 
                className={
                  errors.exerciseId && touched.exerciseId ? "form-control is-invalid" : "form-control"
                }
              >
                <option value="">Select an exercise</option>
                {/* Exercise options would be populated dynamically */}
                <option value="1">Push-Up</option>
                <option value="2">Squat</option>
                <option value="3">Dumbbell Curl</option>
              </Field>
              <ErrorMessage name="exerciseId" component="div" className="invalid-feedback" />
            </div>

            <div className="form-group">
              <label htmlFor="sets">Sets</label>
              <Field 
                type="number" 
                name="sets" 
                className={
                  errors.sets && touched.sets ? "form-control is-invalid" : "form-control"
                }
              />
              <ErrorMessage name="sets" component="div" className="invalid-feedback" />
            </div>

            <div className="form-group">
              <label htmlFor="reps">Reps</label>
              <Field 
                type="number" 
                name="reps" 
                className={
                  errors.reps && touched.reps ? "form-control is-invalid" : "form-control"
                }
              />
              <ErrorMessage name="reps" component="div" className="invalid-feedback" />
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight (optional)</label>
              <Field 
                type="number" 
                name="weight" 
                className={
                  errors.weight && touched.weight ? "form-control is-invalid" : "form-control"
                }
              />
              <ErrorMessage name="weight" component="div" className="invalid-feedback" />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes (optional)</label>
              <Field 
                as="textarea" 
                name="notes" 
                className={
                  errors.notes && touched.notes ? "form-control is-invalid" : "form-control"
                }
              />
              <ErrorMessage name="notes" component="div" className="invalid-feedback" />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Exercise'}
            </button>
            <button type="button" className="btn btn-secondary ml-2" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddExerciseForm;