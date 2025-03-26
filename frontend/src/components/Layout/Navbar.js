import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import '../../styles/Navbar.css';

const Navbar = () => {
  const { isLoggedIn, logout } = useAppContext();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Workout Tracker</Link>
      </div>
      
      {isLoggedIn ? (
        <div className="navbar-menu">
          <Link to="/" className="navbar-item">Dashboard</Link>
          <Link to="/exercises" className="navbar-item">Exercises</Link>
          <button onClick={handleLogout} className="navbar-item logout-btn">
            Logout
          </button>
        </div>
      ) : (
        <div className="navbar-menu">
          <Link to="/login" className="navbar-item">Login</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;