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
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState({
    initial: true,
    form: false,
    deletion: null,
    update: null
  });
  
  // Error states
  const [errors, setErrors] = useState({
    initial: null,
    form: null
  });

  // Initial data load
  const loadInitialData = useCallback(async () => {
    try {
      console.log('Loading initial data...');
      
      // Fetch routines
      const routinesData = await api.getRoutines();
      console.log('Received routines data:', routinesData);
      setRoutines(routinesData);
      
      // Fetch exercises
      const exercisesData = await api.getExercises();
      console.log('Received exercises data:', exercisesData);
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

  // Simplified getRoutineById - uses a single fetch and stores all data
  const getRoutineById = useCallback((routineId) => {
    console.log(`Getting routine by ID: ${routineId}`);
    const parsedId = parseInt(routineId, 10);
    
    // First check if we already have the routine in state
    const routine = routines.find(r => r.id === parsedId);
    
    if (routine) {
      console.log(`Found routine with ID ${routineId}:`, routine);
      
      // Set as current routine (this includes all data from the backend)
      setCurrentRoutine(routine);
      
      return routine;
    } else {
      console.log(`Routine ${routineId} not found in state`);
      return null;
    }
  }, [routines]);

  const createRoutine = async (routineData) => {
    console.log('Creating new routine with data:', routineData);
    setIsLoading(prev => ({ ...prev, form: true }));
    
    try {
      const newRoutine = await api.createRoutine(routineData);
      console.log('New routine created:', newRoutine);
      
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
    console.log(`Updating routine ${routineId} with data:`, routineData);
    setIsLoading(prev => ({ ...prev, update: routineId }));
    
    try {
      const updatedRoutine = await api.updateRoutine(routineId, routineData);
      console.log('Routine updated:', updatedRoutine);
      
      // Update in routines array
      setRoutines(prevRoutines => {
        return prevRoutines.map(r => {
          if (r.id === parseInt(routineId, 10)) {
            // Preserve exercises/variations if they exist
            return {
              ...updatedRoutine,
              exercises: r.exercises || updatedRoutine.exercises,
              variations: r.variations || updatedRoutine.variations
            };
          }
          return r;
        });
      });
      
      // Update currentRoutine if it's the active one
      if (currentRoutine && currentRoutine.id === parseInt(routineId, 10)) {
        setCurrentRoutine(prev => {
          return {
            ...updatedRoutine,
            exercises: prev.exercises || updatedRoutine.exercises,
            variations: prev.variations || updatedRoutine.variations
          };
        });
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
    console.log(`Deleting routine ${routineId}`);
    setIsLoading(prev => ({ ...prev, deletion: routineId }));
    
    try {
      await api.deleteRoutine(routineId);
      console.log(`Routine ${routineId} deleted successfully`);
      
      // Remove from local state
      setRoutines(prevRoutines => prevRoutines.filter(r => r.id !== parseInt(routineId, 10)));
      
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
    console.log('Creating new exercise with data:', exerciseData);
    setIsLoading(prev => ({ ...prev, form: true }));
    
    try {
      const newExercise = await api.createExercise(exerciseData);
      console.log('New exercise created:', newExercise);
      
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

  // Add an exercise to a routine
  const addExerciseToRoutine = async (routineId, exerciseData) => {
    console.log(`Adding exercise to routine ${routineId} with data:`, exerciseData);
    setIsLoading(prev => ({ ...prev, form: true }));
    
    try {
      // Call the API to add the exercise to the routine
      const newVariation = await api.addExerciseToRoutine(routineId, exerciseData);
      console.log(`Added exercise to routine ${routineId}:`, newVariation);
      
      // Ensure the exercise details are included
      if (newVariation && !newVariation.exercise && newVariation.exercise_id) {
        const exerciseDetails = exercises.find(e => e.id === newVariation.exercise_id);
        if (exerciseDetails) {
          newVariation.exercise = exerciseDetails;
        }
      }
      
      // Update routines state to reflect this addition
      setRoutines(prev => {
        return prev.map(routine => {
          // Only update the specific routine
          if (routine.id === parseInt(routineId, 10)) {
            // Create a copy of the routine
            const updatedRoutine = {...routine};
            
            // Add the new variation to this routine
            if (updatedRoutine.variations) {
              updatedRoutine.variations = [...updatedRoutine.variations, newVariation];
            } else if (updatedRoutine.exercises) {
              updatedRoutine.exercises = [...updatedRoutine.exercises, newVariation];
            } else {
              // Initialize if neither exists
              updatedRoutine.exercises = [newVariation];
            }
            
            return updatedRoutine;
          }
          return routine;
        });
      });
      
      // Update current routine if it's the active one
      if (currentRoutine && currentRoutine.id === parseInt(routineId, 10)) {
        setCurrentRoutine(prev => {
          // Create a copy of the current routine
          const updated = {...prev};
          
          // Add the new variation to the current routine
          if (updated.variations) {
            updated.variations = [...updated.variations, newVariation];
          } else if (updated.exercises) {
            updated.exercises = [...updated.exercises, newVariation];
          } else {
            // Initialize if neither exists
            updated.exercises = [newVariation];
          }
          
          return updated;
        });
      }
      
      // Clear errors
      setErrors(prev => ({ ...prev, form: null }));
      
      return newVariation;
    } catch (err) {
      console.error('Error adding exercise to routine:', err);
      setErrors(prev => ({ ...prev, form: err.message || 'Failed to add exercise to routine' }));
      return null;
    } finally {
      setIsLoading(prev => ({ ...prev, form: false }));
    }
  };

  // Update an exercise variation within a routine using the variation ID
  const updateRoutineExercise = async (routineId, variationId, data) => {
    console.log(`Updating exercise variation ${variationId} in routine ${routineId} with data:`, data);
    setIsLoading(prev => ({ ...prev, update: `${routineId}-${variationId}` }));
    
    try {
      // Call the API to update the exercise variation
      const updatedVariation = await api.updateRoutineExercise(routineId, variationId, data);
      console.log(`Updated exercise variation ${variationId} in routine ${routineId}:`, updatedVariation);
      
      // Update routines state to reflect this change
      setRoutines(prev => {
        return prev.map(routine => {
          // Only update the specific routine
          if (routine.id === parseInt(routineId, 10)) {
            // Create a copy of the routine
            const updatedRoutine = {...routine};
            
            // Find and update the specific variation within this routine
            if (updatedRoutine.variations) {
              updatedRoutine.variations = updatedRoutine.variations.map(variation => 
                variation.id === variationId ? updatedVariation : variation
              );
            } else if (updatedRoutine.exercises) {
              updatedRoutine.exercises = updatedRoutine.exercises.map(exercise => 
                exercise.id === variationId ? updatedVariation : exercise
              );
            }
            
            return updatedRoutine;
          }
          return routine;
        });
      });
      
      // Update current routine if it's the active one
      if (currentRoutine && currentRoutine.id === parseInt(routineId, 10)) {
        setCurrentRoutine(prev => {
          // Create a copy of the current routine
          const updated = {...prev};
          
          // Update the specific variation within the current routine
          if (updated.variations) {
            updated.variations = updated.variations.map(variation => 
              variation.id === variationId ? updatedVariation : variation
            );
          } else if (updated.exercises) {
            updated.exercises = updated.exercises.map(exercise => 
              exercise.id === variationId ? updatedVariation : exercise
            );
          }
          
          return updated;
        });
      }
      
      // Clear errors
      setErrors(prev => ({ ...prev, form: null }));
      
      return updatedVariation;
    } catch (err) {
      console.error('Error updating exercise variation:', err);
      setErrors(prev => ({ ...prev, form: err.message || 'Failed to update exercise' }));
      return null;
    } finally {
      setIsLoading(prev => ({ ...prev, update: null }));
    }
  };

  // Remove an exercise variation from a routine using the variation ID
  const removeExerciseFromRoutine = async (routineId, variationId) => {
    console.log(`Removing exercise variation ${variationId} from routine ${routineId}`);
    setIsLoading(prev => ({ ...prev, deletion: `${routineId}-${variationId}` }));
    
    try {
      // Call the API to remove the variation
      await api.removeExerciseFromRoutine(routineId, variationId);
      console.log(`Successfully removed exercise variation ${variationId} from routine ${routineId}`);
      
      // Update routines state to reflect this change
      setRoutines(prev => {
        return prev.map(routine => {
          // Only update the specific routine
          if (routine.id === parseInt(routineId, 10)) {
            // Create a copy of the routine
            const updatedRoutine = {...routine};
            
            // Remove the specific variation from this routine
            if (updatedRoutine.variations) {
              updatedRoutine.variations = updatedRoutine.variations.filter(variation => 
                variation.id !== variationId
              );
            } else if (updatedRoutine.exercises) {
              updatedRoutine.exercises = updatedRoutine.exercises.filter(exercise => 
                exercise.id !== variationId
              );
            }
            
            return updatedRoutine;
          }
          return routine;
        });
      });
      
      // Update current routine if it's the active one
      if (currentRoutine && currentRoutine.id === parseInt(routineId, 10)) {
        setCurrentRoutine(prev => {
          // Create a copy of the current routine
          const updated = {...prev};
          
          // Remove the specific variation from the current routine
          if (updated.variations) {
            updated.variations = updated.variations.filter(variation => 
              variation.id !== variationId
            );
          } else if (updated.exercises) {
            updated.exercises = updated.exercises.filter(exercise => 
              exercise.id !== variationId
            );
          }
          
          return updated;
        });
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
    muscleGroups,
    equipment,
    currentRoutine,
    dataLoaded,
    
    // Loading and error states
    isLoading,
    errors,
    
    // Routine functions
    getRoutineById,
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