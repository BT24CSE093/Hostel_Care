import pool from '../../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface UserRow extends RowDataPacket {
  user_id: number;
  full_name: string;
  email: string | null;
  mobile: string | null;
  password_hash: string;
  role: 'STUDENT' | 'WARDEN' | 'STAFF' | 'ADMIN';
  is_active: number;
  created_at: Date;
}

export interface StudentProfileRow extends RowDataPacket {
  student_id: number;
  user_id: number;
  roll_number: string;
  course: string | null;
}

export interface StaffProfileRow extends RowDataPacket {
  staff_id: number;
  user_id: number;
  staff_type: string;
  availability: string;
}

export class AuthRepository {
  /**
   * Find a user by email.
   */
  async findByEmail(email: string): Promise<UserRow | null> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Find a user by mobile number.
   */
  async findByMobile(mobile: string): Promise<UserRow | null> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE mobile = ?',
      [mobile]
    );
    return rows[0] || null;
  }

  /**
   * Find a user by ID.
   */
  async findById(userId: number): Promise<UserRow | null> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT user_id, full_name, email, mobile, role, is_active, created_at FROM users WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  }

  /**
   * Create a new user. Returns the inserted user_id.
   */
  async createUser(
    fullName: string,
    email: string,
    mobile: string,
    passwordHash: string,
    role: string
  ): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (full_name, email, mobile, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [fullName, email, mobile, passwordHash, role]
    );
    return result.insertId;
  }

  /**
   * Create a student profile linked to a user.
   */
  async createStudentProfile(
    userId: number,
    rollNumber: string,
    course: string
  ): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO student_profiles (user_id, roll_number, course)
       VALUES (?, ?, ?)`,
      [userId, rollNumber, course]
    );
    return result.insertId;
  }

  /**
   * Create a staff profile linked to a user.
   */
  async createStaffProfile(
    userId: number,
    staffType: string
  ): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO staff_profiles (user_id, staff_type)
       VALUES (?, ?)`,
      [userId, staffType]
    );
    return result.insertId;
  }

  /**
   * Get student profile by user_id.
   */
  async getStudentProfile(userId: number): Promise<StudentProfileRow | null> {
    const [rows] = await pool.query<StudentProfileRow[]>(
      'SELECT * FROM student_profiles WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  }

  /**
   * Get staff profile by user_id.
   */
  async getStaffProfile(userId: number): Promise<StaffProfileRow | null> {
    const [rows] = await pool.query<StaffProfileRow[]>(
      'SELECT * FROM staff_profiles WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  }

  /**
   * Check if roll number already exists.
   */
  async findByRollNumber(rollNumber: string): Promise<StudentProfileRow | null> {
    const [rows] = await pool.query<StudentProfileRow[]>(
      'SELECT * FROM student_profiles WHERE roll_number = ?',
      [rollNumber]
    );
    return rows[0] || null;
  }
}
