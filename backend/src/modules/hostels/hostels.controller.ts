import { Request, Response, NextFunction } from 'express';
import { HostelsService } from './hostels.service';

const hostelsService = new HostelsService();

export async function getAllHostels(req: Request, res: Response, next: NextFunction) {
  try {
    const hostels = await hostelsService.getAllHostels();
    res.json({ success: true, data: hostels });
  } catch (error) {
    next(error);
  }
}

export async function getRoomsByHostelId(req: Request, res: Response, next: NextFunction) {
  try {
    const hostelId = parseInt(req.params.id, 10);
    if (isNaN(hostelId)) {
      res.status(400).json({ success: false, message: 'Invalid hostel ID' });
      return;
    }
    const rooms = await hostelsService.getRoomsByHostelId(hostelId);
    res.json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
}

export async function getAllCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await hostelsService.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}
