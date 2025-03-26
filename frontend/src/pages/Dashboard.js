import React, { useEffect } from 'react';
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
    fetchUserData
  } = useAppContext();
  useEffect(() => {

    // Refresh user data including routines

    fetchUserData();

  }, []); 
  useEffect(() => {
    // Check if we need to refresh data
    if (routines.length === 0 && !isLoading.userData) {
      fetchUserData();
    }
  }, [routines.length, isLoading.userData, fetchUserData]);

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
        </div>
        
        {isLoading.userData ? (
          <div className="loading-spinner">Loading your routines...</div>
        ) : errors.userData ? (
          <div className="error-message">{errors.userData}</div>
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
            {routines.map(routine => (
              <RoutineCard key={routine.id} routine={routine} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;