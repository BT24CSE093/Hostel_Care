import pool from '../../config/database';
import { RowDataPacket } from 'mysql2';

export interface HostelRow extends RowDataPacket {
  hostel_id: number;
  hostel_name: string;
  location: string | null;
}

export interface RoomRow extends RowDataPacket {
  room_id: number;
  hostel_id: number;
  room_number: string;
  capacity: number;
}

export interface CategoryRow extends RowDataPacket {
  category_id: number;
  category_name: string;
  description: string | null;
  default_priority: string;
}

export class HostelsRepository {
  async findAllHostels(): Promise<HostelRow[]> {
    const [rows] = await pool.query<HostelRow[]>('SELECT * FROM hostels ORDER BY hostel_name');
    return rows;
  }

  async findRoomsByHostelId(hostelId: number): Promise<RoomRow[]> {
    const [rows] = await pool.query<RoomRow[]>(
      'SELECT * FROM rooms WHERE hostel_id = ? ORDER BY room_number',
      [hostelId]
    );
    return rows;
  }

  async findAllCategories(): Promise<CategoryRow[]> {
    const [rows] = await pool.query<CategoryRow[]>('SELECT * FROM complaint_categories ORDER BY category_name');
    return rows;
  }

  async findHostelById(hostelId: number): Promise<HostelRow | null> {
    const [rows] = await pool.query<HostelRow[]>(
      'SELECT * FROM hostels WHERE hostel_id = ?',
      [hostelId]
    );
    return rows[0] || null;
  }
}
