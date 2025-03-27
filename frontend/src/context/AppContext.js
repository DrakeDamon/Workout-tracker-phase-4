import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import api from '../services/api';

// Create context
const AppContext = createContext(null);

// Custom hook to use the context
function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Create the provider component
function AppProvider({ children }) {
  // Data states
  const [routines, setRoutines] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [currentRoutine, setCurrentRoutine] = useState(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState({
    userData: false,
    routine: false,
    form: false,
    deletion: null,
    update: null
  });
  
  // Error states
  const [errors, setErrors] = useState({
    userData: null,
    routine: null,
    form: null
  });

  // Fetch all user data at once
  const fetchUserData = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, userData: true }));
    try {
      const response = await api.getUserData();
      // Update all state from the single response
      setRoutines(response.routines || []);
      setExercises(response.exercises || []);
      setMuscleGroups(response.muscle_groups || []);
      setEquipment(response.equipment || []);
      
      // Clear errors
      setErrors(prev => ({ ...prev, userData: null }));
    } catch (err) {
      console.error('Error fetching user data:', err);
      setErrors(prev => ({ ...prev, userData: 'Failed to load data' }));
    } finally {
      setIsLoading(prev => ({ ...prev, userData: false }));
    }
  }, []);

  // Fetch data on initial load
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Routine CRUD operations
  const getRoutineById = (routineId) => {
    return routines.find(routine => routine.id === parseInt(routineId, 10));
  };

  const loadRoutineDetails = async (routineId) => {
    // First check if we already have the routine in state
    const existingRoutine = getRoutineById(routineId);
    if (existingRoutine) {
      setCurrentRoutine(existingRoutine);
      return existingRoutine;
    }
    
    // If not in state, fetch from API
    setIsLoading(prev => ({ ...prev, routine: true }));
    try {
      const routine = await api.getRoutine(routineId);
      
      // Update current routine
      setCurrentRoutine(routine);
      
      // Also update the routine in the routines array
      setRoutines(prevRoutines => 
        prevRoutines.map(r => r.id === parseInt(routineId, 10) ? routine : r)
      );
      
      // Clear errors
      setErrors(prev => ({ ...prev, routine: null }));
      
      return routine;
    } catch (err) {
      console.error('Error loading routine details:', err);
      setErrors(prev => ({ ...prev, routine: 'Failed to load routine' }));
      return null;
    } finally {
      setIsLoading(prev => ({ ...prev, routine: false }));
    }
  };

  const createRoutine = async (routineData) => {
    setIsLoading(prev => ({ ...prev, form: true }));
    try {
      const newRoutine = await api.createRoutine(routineData);
      
      // Update local state
      setRoutines(prev => [...prev, newRoutine]);
      
      // Clear errors
      setErrors(prev => ({ ...prev, form: null }));
      
      return newRoutine;
    } catch (err) {
      console.error('Error creating routine:', err);
      setErrors(prev => ({ ...prev, form: err.message || 'Failed to create routine' }));
      return null;
    } finally {
      setIsLoading(prev => ({ ...prev, form: false }));
    }
  };

  const updateRoutine = async (routineId, routineData) => {
    setIsLoading(prev => ({ ...prev, update: routineId }));
    try {
      const updatedRoutine = await api.updateRoutine(routineId, routineData);
      
      // Update in routines array
      setRoutines(prevRoutines => 
        prevRoutines.map(r => r.id === parseInt(routineId, 10) ? updatedRoutine : r)
      );
      
      // Update currentRoutine if it's the active one
      if (currentRoutine && currentRoutine.id === parseInt(routineId, 10)) {
        setCurrentRoutine(updatedRoutine);
      }
      
      // Clear errors
      setErrors(prev => ({ ...prev, form: null }));
      
      return updatedRoutine;
    } catch (err) {
      console.error('Error updating routine:', err);
      setErrors(prev => ({ ...prev, form: err.message || 'Failed to update routine' }));
      return null;
    } finally {
      setIsLoading(prev => ({ ...prev, update: null }));
    }
  };

  const deleteRoutine = async (routineId) => {
    setIsLoading(prev => ({ ...prev, deletion: routineId }));
    try {
      await api.deleteRoutine(routineId);
      
      // Remove from local state
      setRoutines(prevRoutines => 
        prevRoutines.filter(r => r.id !== parseInt(routineId, 10))
      );
      
      // Clear current routine if it was deleted
      if (currentRoutine && currentRoutine.id === parseInt(routineId, 10)) {
        setCurrentRoutine(null);
      }
      
      // Clear errors
      setErrors(prev => ({ ...prev, form: null }));
      
      return true;
    } catch (err) {
      console.error('Error deleting routine:', err);
      setErrors(prev => ({ ...prev, form: err.message || 'Failed to delete routine' }));
      return false;
    } finally {
      setIsLoading(prev => ({ ...prev, deletion: null }));
    }
  };

  // Exercise CRUD operations
  const createExercise = async (exerciseData) => {
    setIsLoading(prev => ({ ...prev, form: true }));
    try {
      const newExercise = await api.createExercise(exerciseData);
      
      // Update local state
      setExercises(prev => [...prev, newExercise]);
      
      // Clear errors
      setErrors(prev => ({ ...prev, form: null }));
      
      return newExercise;
    } catch (err) {
      console.error('Error creating exercise:', err);
      setErrors(prev => ({ ...prev, form: err.message || 'Failed to create exercise' }));
      return null;
    } finally {
      setIsLoading(prev => ({ ...prev, form: false }));
    }
  };

  // Routine Exercise operations
  const addExerciseToRoutine = async (routineId, exerciseData) => {
    setIsLoading(prev => ({ ...prev, form: true }));
    try {
      const newRoutineExercise = await api.addExerciseToRoutine(routineId, exerciseData);
      
      // Update routine in state
      const updatedRoutines = routines.map(routine => {
        if (routine.id === parseInt(routineId, 10)) {
          return {
            ...routine,
            routine_exercises: [...(routine.routine_exercises || []), newRoutineExercise]
          };
        }
        return routine;
      });
      
      setRoutines(updatedRoutines);
      
      // Update current routine if it's affected
      if (currentRoutine && currentRoutine.id === parseInt(routineId, 10)) {
        setCurrentRoutine({
          ...currentRoutine,
          routine_exercises: [...(currentRoutine.routine_exercises || []), newRoutineExercise]
        });
      }
      
      // Clear errors
      setErrors(prev => ({ ...prev, form: null }));
      
      return newRoutineExercise;
    } catch (err) {
      console.error('Error adding exercise to routine:', err);
      setErrors(prev => ({ ...prev, form: err.message || 'Failed to add exercise to routine' }));
      return null;
    } finally {
      setIsLoading(prev => ({ ...prev, form: false }));
    }
  };

  const updateRoutineExercise = async (routineExerciseId, data) => {
    setIsLoading(prev => ({ ...prev, update: routineExerciseId }));
    try {
      const updatedRoutineExercise = await api.updateRoutineExercise(routineExerciseId, data);
      
      // Update routines array
      const updatedRoutines = routines.map(routine => {
        if (routine.routine_exercises && routine.routine_exercises.some(re => re.id === routineExerciseId)) {
          return {
            ...routine,
            routine_exercises: routine.routine_exercises.map(re => 
              re.id === routineExerciseId ? updatedRoutineExercise : re
            )
          };
        }
        return routine;
      });
      
      setRoutines(updatedRoutines);
      
      // Update current routine if it's affected
      if (currentRoutine && currentRoutine.routine_exercises) {
        if (currentRoutine.routine_exercises.some(re => re.id === routineExerciseId)) {
          setCurrentRoutine({
            ...currentRoutine,
            routine_exercises: currentRoutine.routine_exercises.map(re => 
              re.id === routineExerciseId ? updatedRoutineExercise : re
            )
          });
        }
      }
      
      // Clear errors
      setErrors(prev => ({ ...prev, form: null }));
      
      return updatedRoutineExercise;
    } catch (err) {
      console.error('Error updating routine exercise:', err);
      setErrors(prev => ({ ...prev, form: err.message || 'Failed to update exercise' }));
      return null;
    } finally {
      setIsLoading(prev => ({ ...prev, update: null }));
    }
  };

  const deleteRoutineExercise = async (routineExerciseId) => {
    setIsLoading(prev => ({ ...prev, deletion: routineExerciseId }));
    try {
      await api.deleteRoutineExercise(routineExerciseId);
      
      // Update routines array
      const updatedRoutines = routines.map(routine => {
        if (routine.routine_exercises) {
          return {
            ...routine,
            routine_exercises: routine.routine_exercises.filter(re => re.id !== routineExerciseId)
          };
        }
        return routine;
      });
      
      setRoutines(updatedRoutines);
      
      // Update current routine if it's affected
      if (currentRoutine && currentRoutine.routine_exercises) {
        setCurrentRoutine({
          ...currentRoutine,
          routine_exercises: currentRoutine.routine_exercises.filter(re => re.id !== routineExerciseId)
        });
      }
      
      // Clear errors
      setErrors(prev => ({ ...prev, form: null }));
      
      return true;
    } catch (err) {
      console.error('Error deleting routine exercise:', err);
      setErrors(prev => ({ ...prev, form: err.message || 'Failed to delete exercise' }));
      return false;
    } finally {
      setIsLoading(prev => ({ ...prev, deletion: null }));
    }
  };

  // Build the context value object
  const contextValue = {
    // Application data state
    routines,
    exercises,
    muscleGroups,
    equipment,
    currentRoutine,
    
    // Loading and error states
    isLoading,
    errors,
    
    // Data loading function
    fetchUserData,
    
    // Routine functions
    getRoutineById,
    loadRoutineDetails,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    
    // Exercise functions
    createExercise,
    
    // Routine Exercise functions
    addExerciseToRoutine,
    updateRoutineExercise,
    deleteRoutineExercise
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export { AppContext, AppProvider, useAppContext };