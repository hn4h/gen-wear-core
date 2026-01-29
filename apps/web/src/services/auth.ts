import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  register: async (phoneNumber: string, fullName: string, password: string) => {
    const response = await apiClient.post('/api/auth/register', {
      phone_number: phoneNumber,
      full_name: fullName,
      password: password,
    });
    return response.data;
  },

  login: async (phoneNumber: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', {
      phone_number: phoneNumber,
      password: password,
    });
    
    // Store token
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
    }
    
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },
};

export default apiClient;
