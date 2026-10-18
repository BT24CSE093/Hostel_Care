import { ComplaintsRepository } from './complaints.repository';
import { AppError } from '../../middleware/error.middleware';
import { JwtPayload } from '../../middleware/auth.middleware';
import pool from '../../config/database';
import { RowDataPacket } from 'mysql2';

export class ComplaintsService {
  private repo = new ComplaintsRepository();

  /**
   * List complaints based on user's role:
   * - STUDENT: only their own complaints
   * - STAFF: only complaints assigned to them
   * - WARDEN/ADMIN: all complaints
   */
  async listComplaints(user: JwtPayload, status?: string) {
    const filters: any = {};

    if (status) filters.status = status;

    if (user.role === 'STUDENT') {
      // Get student_id from student_profiles
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT student_id FROM student_profiles WHERE user_id = ?',
        [user.userId]
      );
      if (!rows[0]) throw new AppError('Student profile not found', 404);
      filters.studentId = rows[0].student_id;
    } else if (user.role === 'STAFF') {
      // Get staff_id from staff_profiles
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT staff_id FROM staff_profiles WHERE user_id = ?',
        [user.userId]
      );
      if (!rows[0]) throw new AppError('Staff profile not found', 404);
      filters.staffId = rows[0].staff_id;
    }
    // WARDEN and ADMIN see all complaints — no filters

    return this.repo.findAll(filters);
  }

  /**
   * Get a single complaint with access checks.
   */
  async getComplaint(complaintId: number, user: JwtPayload) {
    const complaint = await this.repo.findById(complaintId);
    if (!complaint) {
      throw new AppError('Complaint not found', 404);
    }

    // Access control
    if (user.role === 'STUDENT') {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT student_id FROM student_profiles WHERE user_id = ?',
        [user.userId]
      );
      if (!rows[0] || complaint.student_id !== rows[0].student_id) {
        throw new AppError('Access denied', 403);
      }
    } else if (user.role === 'STAFF') {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT staff_id FROM staff_profiles WHERE user_id = ?',
        [user.userId]
      );
      if (!rows[0]) throw new AppError('Staff profile not found', 404);
      const isAssigned = await this.repo.isAssignedToStaff(complaintId, rows[0].staff_id);
      if (!isAssigned) {
        throw new AppError('Access denied', 403);
      }
    }

    // Get status history
    const statusHistory = await this.repo.getStatusHistory(complaintId);

    return { ...complaint, statusHistory };
  }

  /**
   * Create a new complaint (students only).
   */
  async createComplaint(user: JwtPayload, data: {
    hostelId?: number | null;
    roomId?: number | null;
    roomNumber?: number | string | null;
    categoryId: number;
    title: string;
    description: string;
    priority?: string;
  }) {
    // Get student_id
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT student_id FROM student_profiles WHERE user_id = ?',
      [user.userId]
    );
    if (!rows[0]) {
      throw new AppError('Student profile not found. Only students can file complaints.', 403);
    }
    const studentId = rows[0].student_id;

    // Verify category exists
    const [catRows] = await pool.query<RowDataPacket[]>(
      'SELECT category_id, category_name, default_priority FROM complaint_categories WHERE category_id = ?',
      [data.categoryId]
    );
    if (!catRows[0]) {
      throw new AppError('Complaint category not found', 404);
    }

    const categoryName = catRows[0].category_name;

    // Check if network complaint is a LAN connectivity issue (room number required)
    const isNetworkLanIssue =
      categoryName.toLowerCase() === 'network' &&
      (/\blan\b/i.test(data.title) ||
       /\blan\b/i.test(data.description) ||
       /ethernet/i.test(data.title) ||
       /ethernet/i.test(data.description));

    const isLocationIndependent =
      ['mess', 'sports'].includes(categoryName.toLowerCase()) ||
      (categoryName.toLowerCase() === 'network' && !isNetworkLanIssue);

    // Validate Room Number
    let hasRoomInput = false;
    let roomNumInt: number | null = null;

    if (data.roomNumber !== undefined && data.roomNumber !== null && String(data.roomNumber).trim() !== '') {
      hasRoomInput = true;
      const parsed = Number(data.roomNumber);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 1056) {
        throw new AppError('Room number must be an integer between 1 and 1056', 400);
      }
      roomNumInt = parsed;
    }

    if (!isLocationIndependent && !hasRoomInput && !data.roomId) {
      if (isNetworkLanIssue) {
        throw new AppError('Room number is required for LAN connectivity issues (1 to 1056)', 400);
      }
      throw new AppError(`Room number is required for ${categoryName} complaints (1 to 1056)`, 400);
    }

    // Resolve room_id and reported_room_number
    let resolvedRoomId: number | null = null;
    let reportedRoomNumber: string | null = null;

    if (data.roomId) {
      const [roomRows] = await pool.query<RowDataPacket[]>(
        'SELECT room_id, room_number FROM rooms WHERE room_id = ?',
        [data.roomId]
      );
      if (!roomRows[0]) {
        throw new AppError('Specified room not found', 404);
      }
      resolvedRoomId = roomRows[0].room_id;
      reportedRoomNumber = String(roomRows[0].room_number);
    } else if (roomNumInt !== null) {
      reportedRoomNumber = String(roomNumInt);

      if (data.hostelId) {
        // Look up room within the specified hostel
        const [roomRows] = await pool.query<RowDataPacket[]>(
          'SELECT room_id FROM rooms WHERE hostel_id = ? AND room_number = ?',
          [data.hostelId, reportedRoomNumber]
        );
        if (roomRows[0]) {
          resolvedRoomId = roomRows[0].room_id;
        }
      } else {
        // No hostel specified: check across all hostels
        const [roomRows] = await pool.query<RowDataPacket[]>(
          'SELECT room_id, hostel_id FROM rooms WHERE room_number = ?',
          [reportedRoomNumber]
        );
        if (roomRows.length === 1) {
          resolvedRoomId = roomRows[0].room_id;
        } else if (roomRows.length > 1) {
          throw new AppError(
            `Room number ${reportedRoomNumber} exists in multiple hostels. Please specify your hostel.`,
            400
          );
        }
      }
    }

    const priority = data.priority || catRows[0].default_priority || 'MEDIUM';

    const complaintId = await this.repo.create({
      studentId,
      roomId: resolvedRoomId,
      reportedRoomNumber,
      categoryId: data.categoryId,
      title: data.title,
      description: data.description,
      priority,
    });

    // Insert initial status history (trigger only fires on UPDATE, not INSERT)
    await this.repo.insertStatusHistory(
      complaintId,
      null,
      'SUBMITTED',
      user.userId,
      'Complaint registered'
    );

    return this.repo.findById(complaintId);
  }

  /**
   * Update complaint status (WARDEN, ADMIN, or assigned STAFF).
   *
   * NOTE: The existing trigger `trg_complaint_status_history` fires AFTER UPDATE
   * on complaints and inserts a status history row with hardcoded changed_by=1.
   * This means the history row will show user_id=1 as the changer instead of the
   * actual authenticated user. This is a known limitation of the existing trigger.
   * See database/triggers.sql for the trigger definition.
   */
  async updateStatus(complaintId: number, user: JwtPayload, data: {
    status: string;
    remarks?: string;
  }) {
    const complaint = await this.repo.findById(complaintId);
    if (!complaint) {
      throw new AppError('Complaint not found', 404);
    }

    // Access control for staff
    if (user.role === 'STAFF') {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT staff_id FROM staff_profiles WHERE user_id = ?',
        [user.userId]
      );
      if (!rows[0]) throw new AppError('Staff profile not found', 404);
      const isAssigned = await this.repo.isAssignedToStaff(complaintId, rows[0].staff_id);
      if (!isAssigned) {
        throw new AppError('You are not assigned to this complaint', 403);
      }
    }

    // Students cannot update status
    if (user.role === 'STUDENT') {
      throw new AppError('Students cannot update complaint status', 403);
    }

    await this.repo.updateStatus(complaintId, data.status);

    return this.repo.findById(complaintId);
  }

  /**
   * Assign a complaint to a staff member (WARDEN/ADMIN only).
   *
   * NOTE: Does NOT use the stored procedure AssignComplaint to avoid duplicate
   * status history entries (the procedure inserts a history row AND the trigger
   * fires on the UPDATE, creating a second row). Instead, we handle the
   * assignment manually in a transaction and let the trigger handle history.
   */
  async assignComplaint(complaintId: number, user: JwtPayload, data: {
    staffId: number;
  }) {
    const complaint = await this.repo.findById(complaintId);
    if (!complaint) {
      throw new AppError('Complaint not found', 404);
    }

    // Only SUBMITTED or UNDER_REVIEW complaints can be assigned
    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(complaint.status)) {
      throw new AppError(
        `Cannot assign complaint in '${complaint.status}' status. Must be SUBMITTED or UNDER_REVIEW.`,
        400
      );
    }

    // Verify staff exists and is available
    const [staffRows] = await pool.query<RowDataPacket[]>(
      'SELECT staff_id, availability FROM staff_profiles WHERE staff_id = ?',
      [data.staffId]
    );
    if (!staffRows[0]) {
      throw new AppError('Staff member not found', 404);
    }
    if (staffRows[0].availability !== 'AVAILABLE') {
      throw new AppError('Staff member is not available', 400);
    }

    await this.repo.assignComplaint(complaintId, data.staffId, user.userId);

    return this.repo.findById(complaintId);
  }
}
