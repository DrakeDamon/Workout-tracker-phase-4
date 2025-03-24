import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Consolidated loading state
  const [loadingStates, setLoadingStates] = useState({
    auth: false,
    userData: false,
    routine: false,
    submission: false,
    deletion: null, // Will store ID of item being deleted or null
    exerciseUpdate: null // Will store ID of exercise being updated or null
  });
  
  // Consolidated error state
  const [errors, setErrors] = useState({
    auth: null,
    userData: null,
    routine: null,
    form: null
  });

  const [routines, setRoutines] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [currentRoutine, setCurrentRoutine] = useState(null);
  
  // Helper functions for setting loading state
  const setLoading = (key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  };
  
  // Helper functions for setting and clearing errors
  const setError = (key, message) => {
    setErrors(prev => ({ ...prev, [key]: message }));
  };
  
  const clearError = (key = null) => {
    if (key) {
      setErrors(prev => ({ ...prev, [key]: null }));
    } else {
      // Clear all errors if no key is specified
      setErrors({
        auth: null,
        userData: null,
        routine: null,
        form: null
      });
    }
  };

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading('auth', true);
      try {
        const response = await api.checkAuth();
        if (response.authenticated) {
          setUser(response.user);
          setIsAuthenticated(true);
          await loadUserData();
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError('auth', 'Failed to check authentication');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading('auth', false);
      }
    };

    checkAuth();
  }, []);

  // Load user data (routines, exercises, muscle groups, equipment)
  const loadUserData = useCallback(async () => {
    setLoading('userData', true);
    try {
      const userData = await api.getUserData();
      setRoutines(userData.routines || []);
      setExercises(userData.exercises || []);
      setMuscleGroups(userData.muscle_groups || []);
      setEquipment(userData.equipment || []);
      clearError('userData');
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('userData', 'Failed to load user data');
      setIsAuthenticated(false);
    } finally {
      setLoading('userData', false);
    }
  }, []);

  const login = async (username, password) => {
    setLoading('auth', true);
    clearError('auth');
    try {
      const response = await api.login(username, password);
      setUser(response.user);
      setIsAuthenticated(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      await loadUserData();
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('auth', err.message || 'Login failed');
      return false;
    } finally {
      setLoading('auth', false);
    }
  };

  const logout = async () => {
    setLoading('auth', true);
    try {
      await api.logout();
      setUser(null);
      setIsAuthenticated(false);
      setRoutines([]);
      setExercises([]);
      setMuscleGroups([]);
      setEquipment([]);
      setCurrentRoutine(null);
      clearError('auth');
      return true;
    } catch (err) {
      console.error('Logout error:', err);
      setError('auth', 'Logout failed');
      return false;
    } finally {
      setLoading('auth', false);
    }
  };

  const getRoutineById = (routineId) => {
    return routines.find((routine) => routine.id === parseInt(routineId, 10));
  };

  const loadRoutineDetails = async (routineId) => {
    setLoading('routine', true);
    try {
      // Check if we already have this routine with full details in state
      const existingRoutine = routines.find(r => r.id === parseInt(routineId, 10));
      
      // Check if routine exists and has routine_exercises property
      // This avoids unnecessary API calls if we already have the data
      if (existingRoutine && existingRoutine.routine_exercises) {
        console.log('Using cached routine details:', existingRoutine);
        setCurrentRoutine(existingRoutine);
        clearError('routine');
        return existingRoutine;
      }
      
      console.log('Fetching routine details for routine ID:', routineId);
      const routine = await api.getRoutine(routineId);
      
      // Update currentRoutine and routines state
      setCurrentRoutine(routine);
      setRoutines(prevRoutines => 
        prevRoutines.map(r => r.id === routine.id ? routine : r)
      );
      
      clearError('routine');
      return routine;
    } catch (err) {
      console.error('Error loading routine details:', err);
      
      // Check if this is a network error
      if (err.message && err.message.includes('Network error')) {
        setError('routine', 'Network error: Unable to load routine. Please check your connection and try again.');
      } else {
        setError('routine', 'Failed to load routine details: ' + (err.message || 'Unknown error'));
      }
      
      return null;
    } finally {
      setLoading('routine', false);
    }
  };

  const createRoutine = async (routineData) => {
    setLoading('submission', true);
    try {
      const newRoutine = await api.createRoutine(routineData);
      setRoutines([...routines, newRoutine]);
      clearError('form');
      return newRoutine;
    } catch (err) {
      console.error('Error creating routine:', err);
      setError('form', err.error || 'Failed to create routine');
      return null;
    } finally {
      setLoading('submission', false);
    }
  };

  const updateRoutine = async (routineId, routineData) => {
    setLoading('submission', true);
    try {
      const updatedRoutine = await api.updateRoutine(routineId, routineData);
      setRoutines(routines.map((routine) => (routine.id === updatedRoutine.id ? updatedRoutine : routine)));
      if (currentRoutine && currentRoutine.id === updatedRoutine.id) {
        setCurrentRoutine(updatedRoutine);
      }
      clearError('form');
      return updatedRoutine;
    } catch (err) {
      console.error('Error updating routine:', err);
      setError('form', err.error || 'Failed to update routine');
      return null;
    } finally {
      setLoading('submission', false);
    }
  };

  const deleteRoutine = async (routineId) => {
    setLoading('deletion', routineId);
    try {
      await api.deleteRoutine(routineId);
      setRoutines(routines.filter((routine) => routine.id !== parseInt(routineId, 10)));
      if (currentRoutine && currentRoutine.id === parseInt(routineId, 10)) {
        setCurrentRoutine(null);
      }
      clearError('form');
      return true;
    } catch (err) {
      console.error('Error deleting routine:', err);
      setError('form', err.error || 'Failed to delete routine');
      return false;
    } finally {
      setLoading('deletion', null);
    }
  };

  const filterExercises = async (searchTerm = '') => {
    setLoading('userData', true);
    try {
      const filtered = await api.getExercises({ search: searchTerm });
      setExercises(filtered);
      clearError('userData');
      return filtered;
    } catch (err) {
      console.error('Error filtering exercises:', err);
      setError('userData', 'Failed to fetch exercises. Please check your network connection.');
      setExercises([]);
      return [];
    } finally {
      setLoading('userData', false);
    }
  };

  const addExerciseToRoutine = async (routineId, exerciseData) => {
    setLoading('submission', true);
    try {
      const newRoutineExercise = await api.addExerciseToRoutine(routineId, exerciseData);
      if (currentRoutine && currentRoutine.id === parseInt(routineId, 10)) {
        setCurrentRoutine({
          ...currentRoutine,
          routine_exercises: [...(currentRoutine.routine_exercises || []), newRoutineExercise],
        });
      }
      setRoutines(
        routines.map((routine) =>
          routine.id === parseInt(routineId, 10)
            ? {
                ...routine,
                routine_exercises: [...(routine.routine_exercises || []), newRoutineExercise],
              }
            : routine
        )
      );
      clearError('form');
      return newRoutineExercise;
    } catch (err) {
      console.error('Error adding exercise to routine:', err);
      setError('form', err.error || 'Failed to add exercise to routine');
      return null;
    } finally {
      setLoading('submission', false);
    }
  };

  const updateRoutineExercise = async (routineExerciseId, exerciseData) => {
    setLoading('exerciseUpdate', routineExerciseId);
    try {
      const updatedRoutineExercise = await api.updateRoutineExercise(routineExerciseId, exerciseData);
      if (currentRoutine && currentRoutine.routine_exercises) {
        setCurrentRoutine({
          ...currentRoutine,
          routine_exercises: currentRoutine.routine_exercises.map((re) =>
            re.id === updatedRoutineExercise.id ? updatedRoutineExercise : re
          ),
        });
      }
      setRoutines(
        routines.map((routine) => {
          if (routine.routine_exercises) {
            return {
              ...routine,
              routine_exercises: routine.routine_exercises.map((re) =>
                re.id === updatedRoutineExercise.id ? updatedRoutineExercise : re
              ),
            };
          }
          return routine;
        })
      );
      clearError('form');
      return updatedRoutineExercise;
    } catch (err) {
      console.error('Error updating routine exercise:', err);
      setError('form', err.error || 'Failed to update exercise');
      return null;
    } finally {
      setLoading('exerciseUpdate', null);
    }
  };

  const deleteRoutineExercise = async (routineExerciseId) => {
    setLoading('exerciseUpdate', routineExerciseId);
    try {
      await api.deleteRoutineExercise(routineExerciseId);
      if (currentRoutine && currentRoutine.routine_exercises) {
        setCurrentRoutine({
          ...currentRoutine,
          routine_exercises: currentRoutine.routine_exercises.filter((re) => re.id !== routineExerciseId),
        });
      }
      setRoutines(
        routines.map((routine) => {
          if (routine.routine_exercises) {
            return {
              ...routine,
              routine_exercises: routine.routine_exercises.filter((re) => re.id !== routineExerciseId),
            };
          }
          return routine;
        })
      );
      clearError('form');
      return true;
    } catch (err) {
      console.error('Error deleting routine exercise:', err);
      setError('form', err.error || 'Failed to delete exercise');
      return false;
    } finally {
      setLoading('exerciseUpdate', null);
    }
  };

  const createExercise = async (exerciseData) => {
    setLoading('submission', true);
    try {
      const newExercise = await api.createExercise(exerciseData);
      setExercises([...exercises, newExercise]);
      clearError('form');
      return newExercise;
    } catch (err) {
      console.error('Error creating exercise:', err);
      setError('form', err.error || 'Failed to create exercise');
      return null;
    } finally {
      setLoading('submission', false);
    }
  };  

  // Helper function for handling form submissions with state management
  const handleFormSubmission = async (actionFn, ...args) => {
    setLoading('submission', true);
    clearError('form');
    try {
      console.log(`handleFormSubmission calling ${actionFn.name} with:`, ...args);
      const result = await actionFn(...args);
      console.log(`handleFormSubmission: ${actionFn.name} returned:`, result);
      setLoading('submission', false);
      return result;
    } catch (error) {
      console.error(`handleFormSubmission error in ${actionFn.name}:`, error);
      setError('form', error.message || 'An error occurred');
      setLoading('submission', false);
      throw error;
    }
  };

  // Form state management
  const [activeEdits, setActiveEdits] = useState({
    exerciseId: null,
    routineId: null
  });

  // Function to set active edit for exercise
  const setActiveExerciseEdit = (exerciseId) => {
    setActiveEdits(prev => ({ ...prev, exerciseId }));
  };

  const contextValue = {
    // User state
    user,
    isAuthenticated,
    
    // Loading states
    loadingStates,
    isLoading: {
      auth: loadingStates.auth,
      userData: loadingStates.userData,
      routine: loadingStates.routine,
      submission: loadingStates.submission,
      deletion: (id) => loadingStates.deletion === id,
      exerciseUpdate: (id) => loadingStates.exerciseUpdate === id
    },
    
    // Error states
    errors,
    getError: (key) => errors[key],
    setError,
    clearError,
    
    // Data
    routines,
    exercises,
    muscleGroups,
    equipment,
    currentRoutine,
    
    // Active edits
    activeEdits,
    setActiveExerciseEdit,
    
    // Functions
    login,
    logout,
    refreshData: loadUserData,
    getRoutineById,
    loadRoutineDetails,
    filterExercises,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    createExercise,
    addExerciseToRoutine,
    updateRoutineExercise,
    deleteRoutineExercise,
    handleFormSubmission
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = () => React.useContext(AppContext);