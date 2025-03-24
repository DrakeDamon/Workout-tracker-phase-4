// frontend/src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5555',  // Match Flask's host
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Add retry mechanism for network errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.code === 'ERR_NETWORK' && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('Network error detected, retrying request...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return apiClient(originalRequest);
    }
    return Promise.reject(error);
  }
);

// API methods
const api = {
  // Authentication Routes
  checkAuth: async () => {
    try {
      const response = await apiClient.get('/api/check-auth');
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return { authenticated: false };
      }
      throw error.response?.data || error;
    }
  },

  login: async (username, password) => {
    try {
      const response = await apiClient.post('/api/login', { username, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  logout: async () => {
    try {
      const response = await apiClient.post('/api/logout');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // User Data Route
  getUserData: async () => {
    try {
      const response = await apiClient.get('/api/user-data');
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error.response?.data || error;
    }
  },

  // Routine Routes
  getRoutine: async (routineId) => {
    try {
      console.log(`Fetching routine with ID: ${routineId}`);
      const response = await apiClient.get(`/api/routines/${routineId}`);
      console.log('Routine data received:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching routine ${routineId}:`, error);
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Network error: Please check your connection and try again.');
      }
      throw error.response?.data || error;
    }
  },

  createRoutine: async (routineData) => {
    try {
      const response = await apiClient.post('/api/routines', routineData);
      return response.data;
    } catch (error) {
      console.error('Error creating routine:', error);
      throw error.response?.data || error;
    }
  },

  updateRoutine: async (routineId, routineData) => {
    try {
      const response = await apiClient.put(`/api/routines/${routineId}`, routineData);
      return response.data;
    } catch (error) {
      console.error(`Error updating routine ${routineId}:`, error);
      throw error.response?.data || error;
    }
  },

  deleteRoutine: async (routineId) => {
    try {
      const response = await apiClient.delete(`/api/routines/${routineId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting routine ${routineId}:`, error);
      throw error.response?.data || error;
    }
  },

  // Exercise Routes
  getExercises: async (filters = {}) => {
    try {
      const response = await apiClient.get('/api/exercises', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error.response?.data || error;
    }
  },

  getExercise: async (exerciseId) => {
    try {
      const response = await apiClient.get(`/api/exercises/${exerciseId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createExercise: async (exerciseData) => {
    try {
      const response = await apiClient.post('/api/exercises', exerciseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Routine Exercise Routes
  addExerciseToRoutine: async (routineId, exerciseData) => {
    try {
      const response = await apiClient.post(`/api/routines/${routineId}/exercises`, exerciseData);
      return response.data;
    } catch (error) {
      console.error('Error adding exercise to routine:', error);
      throw error.response?.data || error;
    }
  },

  updateRoutineExercise: async (routineExerciseId, exerciseData) => {
    try {
      const response = await apiClient.put(`/api/routine-exercises/${routineExerciseId}`, exerciseData);
      return response.data;
    } catch (error) {
      console.error('Error updating routine exercise:', error);
      throw error.response?.data || error;
    }
  },

  deleteRoutineExercise: async (routineExerciseId) => {
    try {
      const response = await apiClient.delete(`/api/routine-exercises/${routineExerciseId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting routine exercise:', error);
      throw error.response?.data || error;
    }
  },

  // Utility Routes
  getMuscleGroups: async () => {
    try {
      const response = await apiClient.get('/api/muscle-groups');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getEquipment: async () => {
    try {
      const response = await apiClient.get('/api/equipment');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default api;