import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAppContext } from '../context/AppContext';
import Navbar from '../components/Layout/Navbar';
import '../styles/Login.css';

// Validation schema using Yup
const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(4, 'Password must be at least 4 characters')
});

const Login = () => {
  const [loginError, setLoginError] = useState(null);
  const { login, isLoading } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoginError(null);
    
    try {
      const success = await login(values.username, values.password);
      
      if (success) {
        navigate('/');
      } else {
        setLoginError('Invalid credentials. Please try again.');
      }
    } catch (error) {
      setLoginError(error.message || 'An error occurred during login.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      
      <div className="login-container">
        <div className="login-card">
          <h2>Login to Workout Tracker</h2>
          
          <Formik
            initialValues={{ username: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="login-form">
                {loginError && (
                  <div className="error-message">{loginError}</div>
                )}
                
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <Field 
                    type="text" 
                    name="username" 
                    id="username" 
                    className="form-control" 
                    placeholder="Enter your username"
                  />
                  <ErrorMessage name="username" component="div" className="field-error" />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <Field 
                    type="password" 
                    name="password" 
                    id="password" 
                    className="form-control" 
                    placeholder="Enter your password"
                  />
                  <ErrorMessage name="password" component="div" className="field-error" />
                </div>
                
                <button 
                  type="submit" 
                  className="login-button" 
                  disabled={isSubmitting || isLoading.auth}
                >
                  {isSubmitting || isLoading.auth ? 'Logging in...' : 'Login'}
                </button>
              </Form>
            )}
          </Formik>
          
          <div className="login-info">
            <p>Use the following credentials for testing:</p>
            <p><strong>Username:</strong> testuser</p>
            <p><strong>Password:</strong> testpassword</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;