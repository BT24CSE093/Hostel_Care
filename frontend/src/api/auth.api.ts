import apiClient from './client';
import { ApiResponse, AuthResponse, User } from '../types';

export interface RegisterPayload {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  role: 'STUDENT' | 'WARDEN' | 'STAFF' | 'ADMIN';
  rollNumber?: string;
  course?: string;
  staffType?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    return res.data.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return res.data.data;
  },

  async getMe(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },
};
