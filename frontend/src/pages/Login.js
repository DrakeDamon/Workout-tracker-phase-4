// pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  
  const { login, isLoading, errors } = useAppContext();
  const navigate = useNavigate();
  
  // Get specific loading and error states from context
  const isAuthLoading = isLoading.auth;
  const authError = errors.auth;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDebugInfo(null);
    
    try {
      console.log('Attempting login with:', formData);
      
      if (debugMode) {
        // Try a direct API call for debugging
        try {
          console.log('Testing direct API call...');
          const response = await api.login(formData.username, formData.password);
          setDebugInfo({
            status: 'Direct API call successful',
            data: response
          });
          console.log('Direct API call response:', response);
        } catch (apiError) {
          console.error('Direct API call failed:', apiError);
          setDebugInfo({
            status: 'Direct API call failed',
            error: apiError.message || JSON.stringify(apiError)
          });
        }
      } else {
        // Normal login flow
        const success = await login(formData.username, formData.password);
        if (success) {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Workout Tracker</h1>
          <h2>Login</h2>
        </div>
        
        {authError && (
          <div className="auth-error">
            {authError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              disabled={isAuthLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={isAuthLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isAuthLoading}
          >
            {isAuthLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="login-footer">
          <Link to="/" className="back-link">Back to Dashboard</Link>
          <button 
            onClick={toggleDebugMode} 
            className="debug-toggle"
            disabled={isAuthLoading}
          >
            {debugMode ? 'Disable Debug' : 'Enable Debug'}
          </button>
        </div>
        
        {/* Debug Information */}
        {debugMode && (
          <div className="debug-section">
            <h3>Debug Mode Enabled</h3>
            <p>Login attempts will be logged here and won't redirect.</p>
            
            {debugInfo && (
              <div className="debug-info">
                <h4>{debugInfo.status}</h4>
                <pre>{JSON.stringify(debugInfo.data || debugInfo.error, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;