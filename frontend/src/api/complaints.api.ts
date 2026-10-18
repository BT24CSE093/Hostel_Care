import apiClient from './client';
import { ApiResponse, Complaint, ComplaintPriority } from '../types';

export interface CreateComplaintPayload {
  hostelId?: number | null;
  roomId?: number | null;
  roomNumber?: number | string | null;
  categoryId: number;
  title: string;
  description: string;
  priority?: ComplaintPriority;
}

export interface UpdateStatusPayload {
  status: string;
  remarks?: string;
}

export interface AssignComplaintPayload {
  staffId: number;
}

export const complaintsApi = {
  async getComplaints(status?: string): Promise<Complaint[]> {
    const params = status ? { status } : {};
    const res = await apiClient.get<ApiResponse<Complaint[]>>('/complaints', { params });
    return res.data.data;
  },

  async getComplaint(id: number): Promise<Complaint> {
    const res = await apiClient.get<ApiResponse<Complaint>>(`/complaints/${id}`);
    return res.data.data;
  },

  async createComplaint(payload: CreateComplaintPayload): Promise<Complaint> {
    const res = await apiClient.post<ApiResponse<Complaint>>('/complaints', payload);
    return res.data.data;
  },

  async updateStatus(id: number, payload: UpdateStatusPayload): Promise<Complaint> {
    const res = await apiClient.patch<ApiResponse<Complaint>>(`/complaints/${id}/status`, payload);
    return res.data.data;
  },

  async assignComplaint(id: number, payload: AssignComplaintPayload): Promise<Complaint> {
    const res = await apiClient.post<ApiResponse<Complaint>>(`/complaints/${id}/assign`, payload);
    return res.data.data;
  },
};
