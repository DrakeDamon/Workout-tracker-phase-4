import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
// Import pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import CreateRoutine from './pages/CreateRoutine';
import EditRoutine from './pages/EditRoutine';
import RoutineDetail from './pages/RoutineDetail';
import ExerciseBrowser from './pages/ExerciseBrowser';
import CreateExercise from './pages/CreateExercise';
import Register from './pages/Register';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAppContext();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};


// App Routes
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/register" element={
          <Register />
 
      } />
      
      <Route path="/routines/create" element={
        <ProtectedRoute>
          <CreateRoutine />
        </ProtectedRoute>
      } />
      
      <Route path="/routines/:routineId" element={
        <ProtectedRoute>
          <RoutineDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/routines/:routineId/edit" element={
        <ProtectedRoute>
          <EditRoutine />
        </ProtectedRoute>
      } />
      
      <Route path="/exercises" element={
        <ProtectedRoute>
          <ExerciseBrowser />
        </ProtectedRoute>
      } />
      
      <Route path="/exercises/create" element={
        <ProtectedRoute>
          <CreateExercise />
        </ProtectedRoute>
      } />
      
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