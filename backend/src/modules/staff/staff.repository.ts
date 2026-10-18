import pool from '../../config/database';
import { RowDataPacket } from 'mysql2';

export interface StaffRow extends RowDataPacket {
  staff_id: number;
  user_id: number;
  full_name: string;
  email: string | null;
  staff_type: string;
  availability: string;
}

export interface AssignmentRow extends RowDataPacket {
  assignment_id: number;
  complaint_id: number;
  complaint_title: string;
  complaint_status: string;
  complaint_priority: string;
  assigned_at: Date;
  assignment_status: string;
}

export class StaffRepository {
  async findAll(): Promise<StaffRow[]> {
    const [rows] = await pool.query<StaffRow[]>(
      `SELECT sp.staff_id, sp.user_id, u.full_name, u.email,
              sp.staff_type, sp.availability
       FROM staff_profiles sp
       JOIN users u ON sp.user_id = u.user_id
       WHERE u.is_active = 1
       ORDER BY u.full_name`
    );
    return rows;
  }

  async findAssignmentsByStaffId(staffId: number): Promise<AssignmentRow[]> {
    const [rows] = await pool.query<AssignmentRow[]>(
      `SELECT ca.assignment_id, ca.complaint_id, c.title AS complaint_title,
              c.status AS complaint_status, c.priority AS complaint_priority,
              ca.assigned_at, ca.assignment_status
       FROM complaint_assignments ca
       JOIN complaints c ON ca.complaint_id = c.complaint_id
       WHERE ca.staff_id = ?
       ORDER BY ca.assigned_at DESC`,
      [staffId]
    );
    return rows;
  }
}
