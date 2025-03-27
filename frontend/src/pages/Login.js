import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const { login, errors } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const success = await login(values.username, values.password);
      if (success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <Formik
        initialValues={{ username: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="login-card">
            <div className="login-header">
              <h1>Welcome Back</h1>
              <h2>Log in to your account</h2>
            </div>
            
            <div className="login-form">
              <div className="form-group">
                <Field
                  type="text"
                  name="username"
                  placeholder="Username"
                />
                <ErrorMessage name="username" component="span" className="field-error" />
              </div>
              
              <div className="form-group">
                <Field
                  type="password"
                  name="password"
                  placeholder="Password"
                />
                <ErrorMessage name="password" component="span" className="field-error" />
              </div>
              
              {errors && errors.auth && (
                <div className="auth-error">{errors.auth}</div>
              )}
              
              <button 
                type="submit" 
                className="login-button" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
              
              <Link to="/register" className="register-link">
                Don't have an account? Register here
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Login;