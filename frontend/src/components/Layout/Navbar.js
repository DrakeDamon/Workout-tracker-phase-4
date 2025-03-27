import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Workout Tracker</Link>
      </div>
      
      <div className="navbar-menu">
        <Link to="/" className="navbar-item">Dashboard</Link>
        <Link to="/exercises" className="navbar-item">Exercises</Link>
      </div>
    </nav>
  );
};

export default Navbar;