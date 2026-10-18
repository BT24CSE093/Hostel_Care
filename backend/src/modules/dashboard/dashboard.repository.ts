import pool from '../../config/database';
import { RowDataPacket } from 'mysql2';

export class DashboardRepository {
  /**
   * Summary statistics.
   */
  async getSummary(): Promise<any> {
    const [totalRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total_complaints FROM complaints'
    );
    const [pendingRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS pending_complaints FROM complaints
       WHERE status IN ('SUBMITTED', 'UNDER_REVIEW')`
    );
    const [resolvedRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS resolved_complaints FROM complaints
       WHERE status IN ('RESOLVED', 'CLOSED')`
    );
    const [staffRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total_staff FROM staff_profiles'
    );
    const [hostelRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total_hostels FROM hostels'
    );
    const [expenseRows] = await pool.query<RowDataPacket[]>(
      'SELECT COALESCE(SUM(amount), 0) AS total_expenses FROM maintenance_expenses'
    );
    const [feedbackRows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS feedback_count, COALESCE(ROUND(AVG(rating), 2), 0) AS avg_rating FROM feedback'
    );

    return {
      totalComplaints: totalRows[0].total_complaints,
      pendingComplaints: pendingRows[0].pending_complaints,
      resolvedComplaints: resolvedRows[0].resolved_complaints,
      totalStaff: staffRows[0].total_staff,
      totalHostels: hostelRows[0].total_hostels,
      totalExpenses: expenseRows[0].total_expenses,
      feedbackCount: feedbackRows[0].feedback_count,
      avgRating: feedbackRows[0].avg_rating,
    };
  }

  /**
   * Complaints grouped by status.
   */
  async getComplaintsByStatus(): Promise<RowDataPacket[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT status, COUNT(*) AS count
       FROM complaints
       GROUP BY status
       ORDER BY count DESC`
    );
    return rows;
  }

  /**
   * Complaints grouped by category.
   */
  async getComplaintsByCategory(): Promise<RowDataPacket[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT cc.category_name, COUNT(*) AS count
       FROM complaints c
       JOIN complaint_categories cc ON c.category_id = cc.category_id
       GROUP BY cc.category_id, cc.category_name
       ORDER BY count DESC`
    );
    return rows;
  }
}
