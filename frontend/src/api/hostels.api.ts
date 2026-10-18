import apiClient from './client';
import { ApiResponse, Hostel, Room, ComplaintCategory } from '../types';

export const hostelsApi = {
  async getHostels(): Promise<Hostel[]> {
    const res = await apiClient.get<ApiResponse<Hostel[]>>('/hostels');
    return res.data.data;
  },

  async getRoomsByHostel(hostelId: number): Promise<Room[]> {
    const res = await apiClient.get<ApiResponse<Room[]>>(`/hostels/${hostelId}/rooms`);
    return res.data.data;
  },

  async getCategories(): Promise<ComplaintCategory[]> {
    const res = await apiClient.get<ApiResponse<ComplaintCategory[]>>('/complaint-categories');
    return res.data.data;
  },
};
