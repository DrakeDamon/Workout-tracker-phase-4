// frontend/src/pages/AddExerciseToRoutine.js
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const AddExerciseToRoutine = () => {
  const { routineId } = useParams(); // Get the routine ID from the URL
  const { routines, setRoutines, exercises } = useContext(AppContext);
  const [routine, setRoutine] = useState(null);
  const [exerciseId, setExerciseId] = useState('');
  const [sets, setSets] = useState(2); // Default to 2 sets
  const [reps, setReps] = useState(8); // Default to 8 reps
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();

  // Load the routine from the central state
  useEffect(() => {
    const foundRoutine = routines.find((r) => r.id === parseInt(routineId));
    if (foundRoutine) {
      setRoutine(foundRoutine);
    }
  }, [routineId, routines]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!exerciseId) {
      alert('Please select an exercise');
      return;
    }

    try {
      const response = await axios.post(
        `http://127.0.0.1:5000/api/routines/${routineId}/exercises`,
        {
          exercise_id: parseInt(exerciseId),
          sets,
          reps,
          weight: weight ? parseFloat(weight) : null,
          notes,
        },
        { withCredentials: true }
      );

      // Update the central state: Add the new routine exercise to the routine
      setRoutines((prev) =>
        prev.map((r) =>
          r.id === parseInt(routineId)
            ? {
                ...r,
                routine_exercises: [...r.routine_exercises, response.data],
              }
            : r
        )
      );

      navigate(`/edit-routine/${routineId}`); // Redirect back to the edit routine page
    } catch (error) {
      console.error('Error adding exercise to routine:', error);
      alert(error.response?.data?.error || 'Failed to add exercise');
    }
  };

  if (!routine) return <div>Loading...</div>;

  return (
    <div>
      <h2>Add Exercise to Routine: {routine.name}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Select Exercise:</label>
          <select
            value={exerciseId}
            onChange={(e) => setExerciseId(e.target.value)}
            required
          >
            <option value="">-- Select an Exercise --</option>
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name} ({exercise.muscle_group})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Sets:</label>
          <input
            type="number"
            value={sets}
            onChange={(e) => setSets(parseInt(e.target.value))}
            min="1"
            required
          />
        </div>
        <div>
          <label>Reps:</label>
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(parseInt(e.target.value))}
            min="1"
            required
          />
        </div>
        <div>
          <label>Weight (optional, in lbs):</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            step="0.1"
          />
        </div>
        <div>
          <label>Notes (optional):</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button type="submit">Add Exercise</button>
      </form>
    </div>
  );
};

export default AddExerciseToRoutine;