import axios from 'axios';
import { User } from '@/src/lib/useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.genwear.io.vn';

interface LoginResponse {
  access_token: string;
  user: User;
}

interface UpdateProfileRequest {
  full_name?: string;
}

interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

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

  login: async (phoneNumber: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', {
      phone_number: phoneNumber,
      password: password,
    });
    
        // console.log('[authAPI.login] Response:', response.data);
        // console.log('[authAPI.login] User:', response.data.user);
        // console.log('[authAPI.login] daily_credits_remaining:', response.data.user?.daily_credits_remaining);
    
    // Store token
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
    }
    
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/auth/me');
    // console.log('[authAPI.getCurrentUser] Response:', response.data);
    // console.log('[authAPI.getCurrentUser] daily_credits_remaining:', response.data?.daily_credits_remaining);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.put<User>('/api/auth/me', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post('/api/auth/change-password', data);
  },

  getSubscription: async () => {
    const response = await apiClient.get('/api/auth/subscription');
    return response.data;
  },

  upgradeToPro: async (returnUrl: string, cancelUrl: string) => {
    const response = await apiClient.post('/api/auth/upgrade-to-pro', {
      return_url: returnUrl,
      cancel_url: cancelUrl,
    });
    return response.data;
  },

  upgradeToUltra: async (returnUrl: string, cancelUrl: string) => {
    const response = await apiClient.post('/api/auth/upgrade-to-ultra', {
      return_url: returnUrl,
      cancel_url: cancelUrl,
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },
};

export default apiClient;
