import api from './api';
import type { User, AuthResponse } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
  role: 'admin' | 'manager' | 'team_member';
  country: 'india' | 'america';
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<{ data: { user: User; token: string } }>('/auth/login', credentials);
  if (response.data && response.data.data && response.data.data.token) {
    localStorage.setItem('token', response.data.data.token);
    return {
      user: response.data.data.user,
      token: response.data.data.token
    };
  }
  throw new Error('Invalid response from server');
};

export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<{ data: { user: User; token: string } }>('/auth/register', userData);
  if (response.data && response.data.data) {
    return {
      user: response.data.data.user,
      token: response.data.data.token
    };
  }
  throw new Error('Registration failed: Invalid response format');
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('token');
  }
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<{ data: { user: User } }>('/auth/profile');
  if (response.data && response.data.data && response.data.data.user) {
    return response.data.data.user;
  }
  throw new Error('Failed to fetch user data');
};

interface ProfileUpdateData {
  email?: string;
  password?: string;
  country?: 'india' | 'america';
  role?: 'admin' | 'manager' | 'team_member';
}

interface ChangePasswordData {
  email: string;
  currentPassword: string;
  newPassword: string;
}

interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export const updateProfile = async (data: ProfileUpdateData): Promise<User> => {
  try {
    const response = await api.put<ProfileUpdateResponse>('/auth/profile', data);
    console.log('Profile update response:', response.data);
    if (response.data && response.data.success && response.data.data && response.data.data.user) {
      return response.data.data.user;
    }
    throw new Error('Failed to update profile');
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
};

export const changePassword = async (data: ChangePasswordData): Promise<void> => {
  await api.put('/auth/change-password', data);
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};
