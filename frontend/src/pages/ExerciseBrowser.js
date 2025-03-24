import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ExerciseCard from '../components/Exercises/ExerciseCard';
import '../styles/ExerciseBrowser.css';

const ExerciseBrowser = () => {
  const { exercises, isLoading, errors } = useAppContext();
  const [search, setSearch] = useState('');
  const [filteredExercises, setFilteredExercises] = useState([]);

  // Get specific loading and error states
  const isUserDataLoading = isLoading.userData;
  const userDataError = errors.userData;

  // Update local filteredExercises based on search
  useEffect(() => {
    if (exercises) {
      const lowerSearch = search.toLowerCase();
      const filtered = exercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(lowerSearch)
      );
      setFilteredExercises(filtered);
    } else {
      setFilteredExercises([]);
    }
  }, [search, exercises]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleClearSearch = () => {
    setSearch('');
  };

  if (isUserDataLoading) {
    return <div className="exercise-browser-container loading">Loading exercises...</div>;
  }

  return (
    <div className="exercise-browser-container">
      <div className="exercise-browser-header">
        <h1>Exercise Library</h1>
      </div>

      <div className="action-buttons">
        <Link to="/create-exercise" className="btn btn-primary">
          Create New Exercise
        </Link>
      </div>

      <div className="filter-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={handleSearchChange}
            className="search-input"
          />
          {search && (
            <button onClick={handleClearSearch} className="clear-search-btn">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="exercise-results">
        {userDataError && <div className="error-message">{userDataError}</div>}
        {filteredExercises.length === 0 && !userDataError ? (
          <div className="no-exercises">
            <p>No exercises found with the current filters.</p>
            <p>Try adjusting your search or create a new exercise.</p>
          </div>
        ) : (
          <div className="exercise-grid">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
              />
            ))}
          </div>
        )}
      </div>

      <div className="exercise-browser-footer">
        <Link to="/" className="btn btn-link">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ExerciseBrowser;