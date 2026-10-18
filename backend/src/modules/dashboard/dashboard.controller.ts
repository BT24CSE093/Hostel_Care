import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';

const dashboardService = new DashboardService();

export async function getSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const summary = await dashboardService.getSummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
}

export async function getComplaintsByStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getComplaintsByStatus();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getComplaintsByCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getComplaintsByCategory();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
