export type UserRole = 'STUDENT' | 'WARDEN' | 'STAFF' | 'ADMIN';

export interface User {
  userId: number;
  fullName: string;
  email: string | null;
  mobile?: string | null;
  role: UserRole;
  isActive?: number;
  profile?: any;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Hostel {
  hostel_id: number;
  hostel_name: string;
  location: string | null;
}

export interface Room {
  room_id: number;
  hostel_id: number;
  room_number: string;
  capacity: number;
}

export interface ComplaintCategory {
  category_id: number;
  category_name: string;
  description: string | null;
  default_priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED'
  | 'CANCELLED';

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface StatusHistory {
  history_id: number;
  complaint_id: number;
  old_status: string | null;
  new_status: string;
  changed_by: number;
  remarks: string | null;
  changed_at: string;
  changer_name?: string;
}

export interface Complaint {
  complaint_id: number;
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  created_at: string;
  updated_at: string;
  student_id: number;
  room_id: number | null;
  reported_room_number?: string | null;
  category_id: number;
  student_name?: string;
  room_number?: string | null;
  hostel_name?: string | null;
  category_name?: string;
  statusHistory?: StatusHistory[];
}

export interface StaffMember {
  staff_id: number;
  user_id: number;
  full_name: string;
  email: string | null;
  staff_type: 'ELECTRICIAN' | 'PLUMBER' | 'CARPENTER' | 'CLEANER' | 'GENERAL';
  availability: 'AVAILABLE' | 'BUSY' | 'INACTIVE';
}

export interface StaffAssignment {
  assignment_id: number;
  complaint_id: number;
  complaint_title: string;
  complaint_status: string;
  complaint_priority: string;
  assigned_at: string;
  assignment_status: string;
}

export interface DashboardSummary {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  totalStaff: number;
  totalHostels: number;
  totalExpenses: number | string;
  feedbackCount: number;
  avgRating: number | string;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface CategoryCount {
  category_name: string;
  count: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}
