import axios from 'axios';

// Auto-detect API URL based on environment
const getApiBaseUrl = () => {
  // If VITE_API_URL is set, use it (for custom deployments)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production (Vercel), use relative /api path
  if (import.meta.env.PROD) {
    return '/api';
  }
  
  // In development, use local backend
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Store the getToken function
let getTokenFunction = null;

// Function to set the token getter from Clerk
export const setAuthToken = (getTokenFn) => {
  getTokenFunction = getTokenFn;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token and logging
api.interceptors.request.use(
  async (config) => {
    // Add authentication token if available
    if (getTokenFunction) {
      try {
        const token = await getTokenFunction();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to get auth token:', error);
      }
    }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    // Handle authentication errors
    if (status === 401) {
      console.error('Authentication required or token expired');
      // You could redirect to login page here if needed
    } else if (status === 403) {
      console.error('Access forbidden - insufficient permissions');
    }
    
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Snippet API functions
export const snippetAPI = {
  // Get all snippets with optional filters
  getAll: async (params = {}) => {
    const response = await api.get('/snippets', { params });
    return response.data;
  },

  // Get a single snippet by ID
  getById: async (id) => {
    const response = await api.get(`/snippets/${id}`);
    return response.data;
  },

  // Create a new snippet
  create: async (snippetData) => {
    const response = await api.post('/snippets', snippetData);
    return response.data;
  },

  // Update an existing snippet
  update: async (id, snippetData) => {
    const response = await api.put(`/snippets/${id}`, snippetData);
    return response.data;
  },

  // Delete a snippet
  delete: async (id) => {
    const response = await api.delete(`/snippets/${id}`);
    return response.data;
  },

  // Get statistics
  getStats: async (view = 'my') => {
    const response = await api.get('/stats', { params: { view } });
    return response.data;
  },

  // Search snippets
  search: async (query, filters = {}) => {
    const params = {
      search: query,
      ...filters
    };
    const response = await api.get('/snippets', { params });
    return response.data;
  }
};

export default api;