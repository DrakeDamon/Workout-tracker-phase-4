import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ExerciseCard from '../components/Exercises/ExerciseCard';
import '../styles/ExerciseBrowser.css';

const ExerciseBrowser = () => {
  const { exercises, loading, error } = useAppContext();
  const [search, setSearch] = useState('');
  const [filteredExercises, setFilteredExercises] = useState([]);

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

  const handleAddExercise = async (exerciseId) => {
    alert('Routine selection is not implemented in this version');
  };

  const handleClearSearch = () => {
    setSearch('');
  };

  if (loading) {
    return <div className="exercise-browser-container loading">Loading exercises...</div>;
  }

  return (
    <div className="exercise-browser-container">
      <div className="exercise-browser-header">
        <h1>Exercise Library</h1>
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
        </div>
      </div>

      <div className="exercise-results">
        {error && <div className="error-message">{error}</div>}
        {filteredExercises.length === 0 && !error ? (
          <div className="no-exercises">
            <p>No exercises found with the current filters.</p>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="exercise-grid">
            {filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onAdd={() => handleAddExercise(exercise.id)}
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