import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import CreateRoutine from './pages/CreateRoutine';
import EditRoutine from './pages/EditRoutine';
import ExerciseBrowser from './pages/ExerciseBrowser';
import RoutineDetail from './pages/RoutineDetail';
import CreateExercise from './components/Exercises/CreateExercise';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/exercise-browser" element={<ExerciseBrowser />} />
          <Route path="/create-routine" element={<CreateRoutine />} />
          <Route path="/create-exercise" element={<CreateExercise />} />
          <Route path="/edit-routine/:routineId" element={<EditRoutine />} />
          <Route path="/routine/:routineId" element={<RoutineDetail />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;