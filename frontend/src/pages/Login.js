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

  const { login } = useAppContext();

  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {

    try {

      const success = await login(values.username, values.password);

      

      if (success) {

        navigate('/');

      } else {

        // Handle login failure

        alert('Invalid credentials');

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

        onSubmit={handleSubmit}

      >

        {({ isSubmitting }) => (

          <Form>

            <Field 

              type="text" 

              name="username" 

              placeholder="Username" 

            />

            <Field 

              type="password" 

              name="password" 

              placeholder="Password" 

            />

            <button type="submit" disabled={isSubmitting}>

              {isSubmitting ? 'Logging in...' : 'Login'}

            </button>

          </Form>

        )}

      </Formik>

    </div>

  );

};

export default Login;