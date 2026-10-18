import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: inject JWT Bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hostelcare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized / expired tokens
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not already on the login page, clear storage and redirect
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('hostelcare_token');
        localStorage.removeItem('hostelcare_user');
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
