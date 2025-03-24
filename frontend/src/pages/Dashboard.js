import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import RoutineCard from '../components/Routines/RoutineCard';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { 
    routines, 
    isLoading,
    errors, 
    isAuthenticated, 
    user,
    logout,
    refreshData
  } = useAppContext();
  
  const navigate = useNavigate();
  
  // Get specific loading and error states
  const isUserDataLoading = isLoading.userData;
  const userDataError = errors.userData;

  // Use refreshData in the useEffect
  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated, refreshData]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <h2>Workout Tracker</h2>
        </div>
        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <span className="user-greeting">Hello, {user?.username || 'User'}!</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <Link to="/login" className="login-btn">Login</Link>
          )}
        </div>
      </nav>

      <div className="dashboard-container">
        <h1>Your Workout Routines</h1>
        
        {isAuthenticated ? (
          <>
            <div className="action-buttons">
              <Link to="/create-routine" className="btn btn-primary">
                Create New Routine
              </Link>
              
              <Link to="/exercise-browser" className="btn btn-secondary">
                Browse Exercise Library
              </Link>
            </div>
            
            {isUserDataLoading ? (
              <div className="loading-spinner">Loading your routines...</div>
            ) : userDataError ? (
              <div className="error-message">{userDataError}</div>
            ) : routines.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3>You don't have any workout routines yet.</h3>
                <p>Get started by creating your first routine!</p>
              </div>
            ) : (
              <div className="routines-grid">
                {routines.map(routine => (
                  <RoutineCard key={routine.id} routine={routine} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="login-prompt">
            <h2>Welcome to Workout Tracker</h2>
            <p>Please log in to view and manage your workout routines.</p>
            <Link to="/login" className="btn btn-primary">Login</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;