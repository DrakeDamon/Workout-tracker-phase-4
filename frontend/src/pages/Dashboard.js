import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Navbar from '../components/Layout/Navbar';
import RoutineCard from '../components/routines/RoutineCard';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const {
    routines,
    isLoading,
    errors,
    dataLoaded
  } = useAppContext();
  
  // Sort routines by day of week
  const sortedRoutines = useMemo(() => {
    // Define day order
    const dayOrder = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
      'Sunday': 7,
      '': 8 // Routines with no day will be at the end
    };
    
    // Create a copy of routines to sort
    return [...routines].sort((a, b) => {
      const dayA = a.day_of_week || '';
      const dayB = b.day_of_week || '';
      return dayOrder[dayA] - dayOrder[dayB];
    });
  }, [routines]);
  
  return (
    <div className="app-container">
      <Navbar />
      <div className="dashboard-container">
        <h1>Your Workout Routines</h1>
        <div className="action-buttons">
          <Link to="/routines/create" className="btn btn-primary">
            Create New Routine
          </Link>
          <Link to="/exercises" className="btn btn-secondary">
            Browse Exercise Library
          </Link>
          <Link to="/variations" className="btn btn-secondary">
            Manage Variations
          </Link>
        </div>
        
        {isLoading.initial ? (
          <div className="loading-spinner">Loading your routines...</div>
        ) : errors.initial ? (
          <div className="error-message">{errors.initial}</div>
        ) : routines.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>You don't have any workout routines yet.</h3>
            <p>Get started by creating your first routine!</p>
            <Link to="/routines/create" className="btn btn-primary">
              Create a Routine
            </Link>
          </div>
        ) : (
          <div className="routines-grid">
            {sortedRoutines.map(routine => (
              <RoutineCard key={routine.id} routine={routine} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;