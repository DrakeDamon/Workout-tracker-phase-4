import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Navbar from '../components/Layout/Navbar';
import '../styles/Login.css';
import api from '../services/api';

// Validation schema
const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required')
});

const Register = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const handleSubmit = async (values, { setSubmitting }) => {
    const { username, password } = values;
    
    try {
      const response = await api.register(username, password);
      
      navigate('/login', {
        state: {
          message: 'Registration successful! Please log in with your new account.'
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      setServerError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="app-container">
      <Navbar />
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Register</h1>
            <h2>Create a new account</h2>
          </div>
          
          <Formik
            initialValues={{
              username: '',
              password: '',
              confirmPassword: ''
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="login-form">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <Field
                    type="text"
                    id="username"
                    name="username"
                    className="form-control"
                    disabled={isSubmitting}
                  />
                  <ErrorMessage name="username" component="div" className="error-message" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <Field
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    disabled={isSubmitting}
                  />
                  <ErrorMessage name="password" component="div" className="error-message" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <Field
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-control"
                    disabled={isSubmitting}
                  />
                  <ErrorMessage name="confirmPassword" component="div" className="error-message" />
                </div>
                
                {serverError && (
                  <div className="auth-error">{serverError}</div>
                )}
                
                <button
                  type="submit"
                  className="login-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
                </button>
              </Form>
            )}
          </Formik>
          
          <div className="login-footer">
            <p>Already have an account? <a href="/login" className="back-link">Login</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;