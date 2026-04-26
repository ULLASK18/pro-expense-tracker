import axios from 'axios';

// Set the base URL for the API
// In development, Vite handles the proxy to http://localhost:5001
// We append /api to the base URL so all calls go through the proxy/backend api route
const baseURL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';


const api = axios.create({
  baseURL,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
