import apiClient from './client';
import { ApiResponse, StaffMember, StaffAssignment } from '../types';

export const staffApi = {
  async getStaff(): Promise<StaffMember[]> {
    const res = await apiClient.get<ApiResponse<StaffMember[]>>('/staff');
    return res.data.data;
  },

  async getStaffAssignments(staffId: number): Promise<StaffAssignment[]> {
    const res = await apiClient.get<ApiResponse<StaffAssignment[]>>(`/staff/${staffId}/assignments`);
    return res.data.data;
  },
};
