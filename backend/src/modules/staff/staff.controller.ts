import { Request, Response, NextFunction } from 'express';
import { StaffService } from './staff.service';

const staffService = new StaffService();

export async function getAllStaff(req: Request, res: Response, next: NextFunction) {
  try {
    const staff = await staffService.getAllStaff();
    res.json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
}

export async function getAssignments(req: Request, res: Response, next: NextFunction) {
  try {
    const staffId = parseInt(req.params.id, 10);
    if (isNaN(staffId)) {
      res.status(400).json({ success: false, message: 'Invalid staff ID' });
      return;
    }
    const assignments = await staffService.getAssignments(staffId);
    res.json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
}
