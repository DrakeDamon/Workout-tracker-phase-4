// Base API URL from environment or default to localhost:5555
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5555';

// Helper function for fetch requests
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    console.log('Fetching URL:', url);
    console.log('Fetch Options:', options);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error Response:', errorText);
      
      const error = new Error(errorText || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json') && response.status !== 204) {
      const data = await response.json();
      console.log('Response Data:', data);
      return data;
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

  // Variation Types endpoints
  getVariationTypes: async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/variation-types`);
  },

  createVariationType: async (typeData) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/variation-types`, {
      method: 'POST',
      body: JSON.stringify(typeData),
    });
  },

  // Routine Exercise endpoints (showing the many-through relationship)
  getRoutineExercises: async (routineId) => {
    console.log(`Fetching exercises for routine ${routineId}`);
    return fetchWithErrorHandling(`${API_BASE_URL}/api/routines/${routineId}/exercises`);
  },

  getRoutineExercise: async (routineId, variationId) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/routines/${routineId}/exercises/${variationId}`);
  },

  addExerciseToRoutine: async (routineId, exerciseData) => {
    console.log(`Adding exercise to routine ${routineId}:`, exerciseData);
    return fetchWithErrorHandling(`${API_BASE_URL}/api/routines/${routineId}/variations`, {
      method: 'POST',
      body: JSON.stringify(exerciseData),
    });
  },

  updateRoutineExercise: async (routineId, variationId, data) => {
    console.log(`Updating exercise variation ${variationId} in routine ${routineId}:`, data);
    return fetchWithErrorHandling(`${API_BASE_URL}/api/routines/${routineId}/variations/${variationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  removeExerciseFromRoutine: async (routineId, variationId) => {
    console.log(`Removing exercise variation ${variationId} from routine ${routineId}`);
    return fetchWithErrorHandling(`${API_BASE_URL}/api/routines/${routineId}/variations/${variationId}`, {
      method: 'DELETE',
    });
  }
};

export default api;