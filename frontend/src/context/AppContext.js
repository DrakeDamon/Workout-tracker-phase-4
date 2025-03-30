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
  const [routineExercises, setRoutineExercises] = useState({});
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [currentRoutine, setCurrentRoutine] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState({
    initial: true,
    routineExercises: false,
    form: false,
    deletion: null,
    update: null
  });
  
  // Error states
  const [errors, setErrors] = useState({
    initial: null,
    routineExercises: null,
    form: null
  });

  // Initial data load
  const loadInitialData = useCallback(async () => {
    try {
      // Fetch routines
      const routinesData = await api.getRoutines();
      setRoutines(routinesData);
      
      // Fetch exercises
      const exercisesData = await api.getExercises();
      setExercises(exercisesData);
      
      // Extract unique muscle groups and equipment
      const uniqueMuscleGroups = [...new Set(exercisesData.map(exercise => exercise.muscle_group).filter(Boolean))];
      const uniqueEquipment = [...new Set(exercisesData.map(exercise => exercise.equipment).filter(Boolean))];
      setMuscleGroups(uniqueMuscleGroups);
      setEquipment(uniqueEquipment);
      
      // Clear any errors
      setErrors(prev => ({ ...prev, initial: null }));
      setDataLoaded(true);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setErrors(prev => ({ ...prev, initial: 'Failed to load data. Please refresh the page.' }));
    } finally {
      setIsLoading(prev => ({ ...prev, initial: false }));
    }
  }, []);

  // Load data on initial mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Routine functions
  const getRoutineById = (routineId) => {
    const parsedId = parseInt(routineId, 10);
    const routine = routines.find(r => r.id === parsedId);
    
    if (routine) {
      // Set as current routine
      setCurrentRoutine(routine);
      
      // Load the exercises for this routine if not already loaded
      if (!routineExercises[parsedId]) {
        loadRoutineExercises(parsedId);
      } else {
        // Return the routine with its exercises
        return {
          ...routine,
          exercises: routineExercises[parsedId] || []
        };
      }
    }
    
    return routine;
  };

  // Load exercises for a specific routine
  const loadRoutineExercises = async (routineId) => {
    setIsLoading(prev => ({ ...prev, routineExercises: true }));
    try {
      const exercises = await api.getRoutineExercises(routineId);
      
      // Update routineExercises state
      setRoutineExercises(prev => ({
        ...prev,
        [routineId]: exercises
      }));
      
      // If this is the current routine, update it with exercises
      if (currentRoutine && currentRoutine.id === parseInt(routineId, 10)) {
        setCurrentRoutine(prev => ({
          ...prev,
          exercises: exercises
        }));
      }
      
      setErrors(prev => ({ ...prev, routineExercises: null }));
      return exercises;
    } catch (err) {
      console.error(`Error loading exercises for routine ${routineId}:`, err);
      setErrors(prev => ({ ...prev, routineExercises: `Failed to load exercises for this routine` }));
      return [];
    } finally {
      setIsLoading(prev => ({ ...prev, routineExercises: false }));
    }
  };

  const createRoutine = async (routineData) => {
    setIsLoading(prev => ({ ...prev, form: true }));
    try {
      const newRoutine = await api.createRoutine(routineData);
      
      // Update local state
      setRoutines(prev => [...prev, newRoutine]);
      
      // Initialize empty exercises array for this routine
      setRoutineExercises(prev => ({
        ...prev,
        [newRoutine.id]: []
      }));
      
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
        setCurrentRoutine(prev => ({
          ...prev,
          ...updatedRoutine,
          exercises: prev.exercises // Preserve exercises
        }));
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
      
      // Remove exercises for this routine
      setRoutineExercises(prev => {
        const newState = { ...prev };
        delete newState[routineId];
        return newState;
      });
      
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

  // Exercise functions
  const createExercise = async (exerciseData) => {
    setIsLoading(prev => ({ ...prev, form: true }));
    try {
      const newExercise = await api.createExercise(exerciseData);
      
      // Update local state
      setExercises(prev => [...prev, newExercise]);
      
      // Update muscle groups and equipment lists if needed
      if (newExercise.muscle_group && !muscleGroups.includes(newExercise.muscle_group)) {
        setMuscleGroups(prev => [...prev, newExercise.muscle_group]);
      }
      
      if (newExercise.equipment && !equipment.includes(newExercise.equipment)) {
        setEquipment(prev => [...prev, newExercise.equipment]);
      }
      
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

  // Routine Exercise functions (representing the many-through relationship)
  const addExerciseToRoutine = async (routineId, exerciseData) => {
    setIsLoading(prev => ({ ...prev, form: true }));
    try {
      const newRoutineExercise = await api.addExerciseToRoutine(routineId, exerciseData);
      
      // Update routineExercises state
      setRoutineExercises(prev => {
        const routineExerciseList = prev[routineId] || [];
        return {
          ...prev,
          [routineId]: [...routineExerciseList, newRoutineExercise]
        };
      });
      
      // Update current routine if it's the active one
      if (currentRoutine && currentRoutine.id === parseInt(routineId, 10)) {
        setCurrentRoutine(prev => ({
          ...prev,
          exercises: [...(prev.exercises || []), newRoutineExercise]
        }));
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

  const updateRoutineExercise = async (routineId, exerciseId, data) => {
    setIsLoading(prev => ({ ...prev, update: `${routineId}-${exerciseId}` }));
    try {
      const updatedRoutineExercise = await api.updateRoutineExercise(routineId, exerciseId, data);
      
      // Update routineExercises state
      setRoutineExercises(prev => {
        const routineExerciseList = prev[routineId] || [];
        return {
          ...prev,
          [routineId]: routineExerciseList.map(re => 
            re.exercise.id === exerciseId ? updatedRoutineExercise : re
          )
        };
      });
      
      // Update current routine if it's the active one
      if (currentRoutine && currentRoutine.id === parseInt(routineId, 10)) {
        setCurrentRoutine(prev => ({
          ...prev,
          exercises: (prev.exercises || []).map(re => 
            re.exercise.id === exerciseId ? updatedRoutineExercise : re
          )
        }));
      }
      
      // Clear errors
      setErrors(prev => ({ ...prev, form: null }));
      
      return updatedRoutineExercise;
    } catch (err) {
      console.error('Error updating exercise in routine:', err);
      setErrors(prev => ({ ...prev, form: err.message || 'Failed to update exercise in routine' }));
      return null;
    } finally {
      setIsLoading(prev => ({ ...prev, update: null }));
    }
  };

  const removeExerciseFromRoutine = async (routineId, exerciseId) => {
    setIsLoading(prev => ({ ...prev, deletion: `${routineId}-${exerciseId}` }));
    try {
      await api.removeExerciseFromRoutine(routineId, exerciseId);
      
      // Update routineExercises state
      setRoutineExercises(prev => {
        const routineExerciseList = prev[routineId] || [];
        return {
          ...prev,
          [routineId]: routineExerciseList.filter(re => re.exercise.id !== exerciseId)
        };
      });
      
      // Update current routine if it's the active one
      if (currentRoutine && currentRoutine.id === parseInt(routineId, 10)) {
        setCurrentRoutine(prev => ({
          ...prev,
          exercises: (prev.exercises || []).filter(re => re.exercise.id !== exerciseId)
        }));
      }
      
      // Clear errors
      setErrors(prev => ({ ...prev, form: null }));
      
      return true;
    } catch (err) {
      console.error('Error removing exercise from routine:', err);
      setErrors(prev => ({ ...prev, form: err.message || 'Failed to remove exercise from routine' }));
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
    routineExercises,
    muscleGroups,
    equipment,
    currentRoutine,
    dataLoaded,
    
    // Loading and error states
    isLoading,
    errors,
    
    // Routine functions
    getRoutineById,
    loadRoutineExercises,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    
    // Exercise functions
    createExercise,
    
    // Routine Exercise functions
    addExerciseToRoutine,
    updateRoutineExercise,
    removeExerciseFromRoutine
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export { AppContext, AppProvider, useAppContext };