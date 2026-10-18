import pool from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface ComplaintRow extends RowDataPacket {
  complaint_id: number;
  student_id: number;
  room_id: number | null;
  reported_room_number?: string | null;
  category_id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  student_name?: string;
  room_number?: string | null;
  hostel_name?: string | null;
  category_name?: string;
}

export interface StatusHistoryRow extends RowDataPacket {
  history_id: number;
  complaint_id: number;
  old_status: string | null;
  new_status: string;
  changed_by: number;
  remarks: string | null;
  changed_at: Date;
  changer_name?: string;
}

export class ComplaintsRepository {
  /**
   * Get all complaints using the v_complaint_details view.
   * Supports filtering by student_id for students.
   */
  async findAll(filters?: { studentId?: number; staffId?: number; status?: string }): Promise<ComplaintRow[]> {
    let query = `
      SELECT c.complaint_id, c.title, c.description, c.priority, c.status,
             c.created_at, c.updated_at, c.student_id, c.room_id, c.category_id,
             c.reported_room_number,
             u.full_name AS student_name,
             COALESCE(r.room_number, c.reported_room_number) AS room_number,
             h.hostel_name,
             cc.category_name
      FROM complaints c
      JOIN student_profiles sp ON c.student_id = sp.student_id
      JOIN users u ON sp.user_id = u.user_id
      LEFT JOIN rooms r ON c.room_id = r.room_id
      LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
      JOIN complaint_categories cc ON c.category_id = cc.category_id
    `;
    const conditions: string[] = [];
    const params: any[] = [];

    if (filters?.studentId) {
      conditions.push('c.student_id = ?');
      params.push(filters.studentId);
    }

    if (filters?.staffId) {
      // Staff see only complaints assigned to them
      query += ' JOIN complaint_assignments ca ON c.complaint_id = ca.complaint_id ';
      conditions.push('ca.staff_id = ?');
      conditions.push("ca.assignment_status = 'ACTIVE'");
      params.push(filters.staffId);
    }

    if (filters?.status) {
      conditions.push('c.status = ?');
      params.push(filters.status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY c.created_at DESC';

    const [rows] = await pool.query<ComplaintRow[]>(query, params);
    return rows;
  }

  /**
   * Get a single complaint by ID with full details.
   */
  async findById(complaintId: number): Promise<ComplaintRow | null> {
    const [rows] = await pool.query<ComplaintRow[]>(
      `SELECT c.complaint_id, c.title, c.description, c.priority, c.status,
              c.created_at, c.updated_at, c.student_id, c.room_id, c.category_id,
              c.reported_room_number,
              u.full_name AS student_name,
              COALESCE(r.room_number, c.reported_room_number) AS room_number,
              h.hostel_name,
              cc.category_name
       FROM complaints c
       JOIN student_profiles sp ON c.student_id = sp.student_id
       JOIN users u ON sp.user_id = u.user_id
       LEFT JOIN rooms r ON c.room_id = r.room_id
       LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
       JOIN complaint_categories cc ON c.category_id = cc.category_id
       WHERE c.complaint_id = ?`,
      [complaintId]
    );
    return rows[0] || null;
  }

  /**
   * Create a new complaint.
   */
  async create(data: {
    studentId: number;
    roomId: number | null;
    reportedRoomNumber?: string | null;
    categoryId: number;
    title: string;
    description: string;
    priority: string;
  }): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO complaints (student_id, room_id, reported_room_number, category_id, title, description, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.studentId, data.roomId, data.reportedRoomNumber || null, data.categoryId, data.title, data.description, data.priority]
    );
    return result.insertId;
  }

  /**
   * Insert an initial status history record (for creation — trigger doesn't fire on INSERT).
   */
  async insertStatusHistory(
    complaintId: number,
    oldStatus: string | null,
    newStatus: string,
    changedBy: number,
    remarks: string
  ): Promise<void> {
    await pool.query(
      `INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by, remarks)
       VALUES (?, ?, ?, ?, ?)`,
      [complaintId, oldStatus, newStatus, changedBy, remarks]
    );
  }

  /**
   * Update complaint status.
   * NOTE: The existing trigger trg_complaint_status_history fires AFTER UPDATE
   * and inserts a history row with hardcoded changed_by=1.
   * We let the trigger handle history for status updates to avoid duplicates.
   */
  async updateStatus(complaintId: number, newStatus: string): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE complaints SET status = ? WHERE complaint_id = ?',
      [newStatus, complaintId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Assign a complaint to a staff member.
   * Uses a transaction to insert assignment + update status atomically.
   * The trigger will handle status history (with changed_by=1 limitation).
   */
  async assignComplaint(
    complaintId: number,
    staffId: number,
    assignedBy: number
  ): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Insert assignment record
      await conn.query(
        `INSERT INTO complaint_assignments (complaint_id, staff_id, assigned_by, assignment_status)
         VALUES (?, ?, ?, 'ACTIVE')`,
        [complaintId, staffId, assignedBy]
      );

      // Update complaint status — trigger fires and records history
      await conn.query(
        `UPDATE complaints SET status = 'ASSIGNED' WHERE complaint_id = ?`,
        [complaintId]
      );

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  /**
   * Get the status history for a complaint.
   */
  async getStatusHistory(complaintId: number): Promise<StatusHistoryRow[]> {
    const [rows] = await pool.query<StatusHistoryRow[]>(
      `SELECT csh.*, u.full_name AS changer_name
       FROM complaint_status_history csh
       JOIN users u ON csh.changed_by = u.user_id
       WHERE csh.complaint_id = ?
       ORDER BY csh.changed_at ASC`,
      [complaintId]
    );
    return rows;
  }

  /**
   * Check if a complaint belongs to a specific student.
   */
  async belongsToStudent(complaintId: number, studentId: number): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT 1 FROM complaints WHERE complaint_id = ? AND student_id = ?',
      [complaintId, studentId]
    );
    return rows.length > 0;
  }

  /**
   * Check if a complaint is assigned to a specific staff member.
   */
  async isAssignedToStaff(complaintId: number, staffId: number): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 1 FROM complaint_assignments
       WHERE complaint_id = ? AND staff_id = ? AND assignment_status = 'ACTIVE'`,
      [complaintId, staffId]
    );
    return rows.length > 0;
  }
}
