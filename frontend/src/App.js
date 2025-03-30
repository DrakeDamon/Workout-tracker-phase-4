import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Import pages
import Dashboard from './pages/Dashboard';
import CreateRoutine from './pages/CreateRoutine';
import RoutineDetail from './pages/RoutineDetail';
import ExerciseBrowser from './pages/ExerciseBrowser';
import VariationsManager from './pages/VariationsManager';

// App Routes
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/routines/create" element={<CreateRoutine />} />
      <Route path="/routines/:routineId" element={<RoutineDetail />} />
      <Route path="/exercises" element={<ExerciseBrowser />} />
      <Route path="/variations" element={<VariationsManager />} />
      
      {/* Catch all route - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Main App component
function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app">
          <AppRoutes />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;