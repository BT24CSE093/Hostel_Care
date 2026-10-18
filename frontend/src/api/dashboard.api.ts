import apiClient from './client';
import { ApiResponse, DashboardSummary, StatusCount, CategoryCount } from '../types';

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    const res = await apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
    return res.data.data;
  },

  async getComplaintsByStatus(): Promise<StatusCount[]> {
    const res = await apiClient.get<ApiResponse<StatusCount[]>>('/dashboard/complaints-by-status');
    return res.data.data;
  },

  async getComplaintsByCategory(): Promise<CategoryCount[]> {
    const res = await apiClient.get<ApiResponse<CategoryCount[]>>('/dashboard/complaints-by-category');
    return res.data.data;
  },
};
