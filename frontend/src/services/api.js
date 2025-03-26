// Base API URL from environment or default to localhost:5555
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5555';

// Helper function for fetch requests
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    console.log('Fetching URL:', url); // Add logging
    console.log('Fetch Options:', options); // Add logging

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('Response Status:', response.status); // Add logging

    if (!response.ok) {
      const errorText = await response.text(); // Get full error response
      console.error('Error Response:', errorText);
      
      const error = new Error(errorText || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json') && response.status !== 204) {
      return await response.json();
    }
    
    return {};
  } catch (error) {
    console.error('Fetch Error Details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    throw error;
  }
};

// API methods
const api = {
  // GET all data at once (user data, routines, exercises, etc.)
  getUserData: async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/user-data`);
  },

  // Routine endpoints
  getRoutines: async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/routines`);
  },

  getRoutine: async (routineId) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/routines/${routineId}`);
  },

  createRoutine: async (routineData) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/routines`, {
      method: 'POST',
      body: JSON.stringify(routineData),
    });
  },

  updateRoutine: async (routineId, routineData) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/routines/${routineId}`, {
      method: 'PUT',
      body: JSON.stringify(routineData),
    });
  },

  deleteRoutine: async (routineId) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/routines/${routineId}`, {
      method: 'DELETE',
    });
  },

  // Exercise endpoints
  getExercises: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const url = `${API_BASE_URL}/api/exercises${queryParams.toString() ? `?${queryParams}` : ''}`;
    return fetchWithErrorHandling(url);
  },

  getExercise: async (exerciseId) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/exercises/${exerciseId}`);
  },

  createExercise: async (exerciseData) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/exercises`, {
      method: 'POST',
      body: JSON.stringify(exerciseData),
    });
  },

  // Routine Exercise endpoints
  addExerciseToRoutine: async (routineId, exerciseData) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/routines/${routineId}/exercises`, {
      method: 'POST',
      body: JSON.stringify(exerciseData),
    });
  },

  updateRoutineExercise: async (routineExerciseId, data) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/routine-exercises/${routineExerciseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteRoutineExercise: async (routineExerciseId) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/routine-exercises/${routineExerciseId}`, {
      method: 'DELETE',
    });
  },

  // Authentication
  login: async (username, password) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

// Make sure this is in your api.js
checkSession: async () => {
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/check_session`);
    return response;
  } catch (error) {
    // If status is 401, just return null (not logged in)
    if (error.status === 401) {
      return null;
    }
    // For other errors, re-throw
    throw error;
  }
},

  logout: async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/logout`, {
      method: 'POST',
    });
  },

  checkAuth: async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/check-auth`);
  }
};

export default api;