// frontend/src/services/api.js
const API_BASE_URL = 'http://localhost:5555';

// Helper function for fetch requests
const fetchWithRetry = async (url, options = {}, retries = 1) => {
  try {
    // Add logging to debug
    console.log('Attempting fetch to:', url);
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include',  // This is important for cookies/session
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    console.log('Response status:', response.status);

    // Check if response is not ok (status outside the range 200-299)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `HTTP Error: ${response.status}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // For successful responses, check if there's content before parsing as JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json') && response.status !== 204) {
      return await response.json();
    }
    
    return {};
  } catch (error) {
    console.error('Fetch error:', error);
    
    // If we have a network error and retries left, try again after a delay
    if ((error.name === 'TypeError' || error.message === 'Failed to fetch') && retries > 0) {
      console.warn('Network error detected, retrying request...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

// API methods
const api = {
  // Authentication Routes
  checkAuth: async () => {
    try {
      return await fetchWithRetry(`${API_BASE_URL}/api/check-auth`);
    } catch (error) {
      if (error.status === 401) {
        return { authenticated: false };
      }
      throw error;
    }
  },

  login: async (username, password) => {
    try {
      return await fetchWithRetry(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      return await fetchWithRetry(`${API_BASE_URL}/api/logout`, {
        method: 'POST',
      });
    } catch (error) {
      throw error;
    }
  },

  // User Data Route
  getUserData: async () => {
    try {
      return await fetchWithRetry(`${API_BASE_URL}/api/user-data`);
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  },

  // Routine Routes
  getRoutine: async (routineId) => {
    try {
      console.log(`Fetching routine with ID: ${routineId}`);
      return await fetchWithRetry(`${API_BASE_URL}/api/routines/${routineId}`);
    } catch (error) {
      console.error(`Error fetching routine ${routineId}:`, error);
      if (error.name === 'TypeError' || error.message === 'Failed to fetch') {
        throw new Error('Network error: Please check your connection and try again.');
      }
      throw error;
    }
  },

  createRoutine: async (routineData) => {
    try {
      return await fetchWithRetry(`${API_BASE_URL}/api/routines`, {
        method: 'POST',
        body: JSON.stringify(routineData),
      });
    } catch (error) {
      console.error('Error creating routine:', error);
      throw error;
    }
  },

  updateRoutine: async (routineId, routineData) => {
    try {
      return await fetchWithRetry(`${API_BASE_URL}/api/routines/${routineId}`, {
        method: 'PUT',
        body: JSON.stringify(routineData),
      });
    } catch (error) {
      console.error(`Error updating routine ${routineId}:`, error);
      throw error;
    }
  },

  deleteRoutine: async (routineId) => {
    try {
      return await fetchWithRetry(`${API_BASE_URL}/api/routines/${routineId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Error deleting routine ${routineId}:`, error);
      throw error;
    }
  },

  // Exercise Routes
  getExercises: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const url = `${API_BASE_URL}/api/exercises${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await fetchWithRetry(url);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
  },

  getExercise: async (exerciseId) => {
    try {
      return await fetchWithRetry(`${API_BASE_URL}/api/exercises/${exerciseId}`);
    } catch (error) {
      throw error;
    }
  },

  createExercise: async (exerciseData) => {
    try {
      console.log('Creating new exercise:', exerciseData);
      return await fetchWithRetry(`${API_BASE_URL}/api/exercises`, {
        method: 'POST',
        body: JSON.stringify(exerciseData),
      });
    } catch (error) {
      console.error('Error creating exercise:', error);
      throw error;
    }
  },

  // Routine Exercise Routes
  addExerciseToRoutine: async (routineId, exerciseData) => {
    try {
      return await fetchWithRetry(`${API_BASE_URL}/api/routines/${routineId}/exercises`, {
        method: 'POST',
        body: JSON.stringify(exerciseData),
      });
    } catch (error) {
      console.error('Error adding exercise to routine:', error);
      throw error;
    }
  },

  updateRoutineExercise: async (routineExerciseId, exerciseData) => {
    try {
      return await fetchWithRetry(`${API_BASE_URL}/api/routine-exercises/${routineExerciseId}`, {
        method: 'PUT',
        body: JSON.stringify(exerciseData),
      });
    } catch (error) {
      console.error('Error updating routine exercise:', error);
      throw error;
    }
  },

  deleteRoutineExercise: async (routineExerciseId) => {
    try {
      return await fetchWithRetry(`${API_BASE_URL}/api/routine-exercises/${routineExerciseId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting routine exercise:', error);
      throw error;
    }
  },

  // Utility Routes
  getMuscleGroups: async () => {
    try {
      return await fetchWithRetry(`${API_BASE_URL}/api/muscle-groups`);
    } catch (error) {
      throw error;
    }
  },

  getEquipment: async () => {
    try {
      return await fetchWithRetry(`${API_BASE_URL}/api/equipment`);
    } catch (error) {
      throw error;
    }
  },
};

export default api;