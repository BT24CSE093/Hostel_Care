import { Request, Response, NextFunction } from 'express';
import { ComplaintsService } from './complaints.service';

const complaintsService = new ComplaintsService();

/**
 * GET /api/complaints
 */
export async function listComplaints(req: Request, res: Response, next: NextFunction) {
  try {
    const status = req.query.status as string | undefined;
    const complaints = await complaintsService.listComplaints(req.user!, status);
    res.json({ success: true, data: complaints, count: complaints.length });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/complaints/:id
 */
export async function getComplaint(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid complaint ID' });
      return;
    }
    const complaint = await complaintsService.getComplaint(id, req.user!);
    res.json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/complaints
 */
export async function createComplaint(req: Request, res: Response, next: NextFunction) {
  try {
    const complaint = await complaintsService.createComplaint(req.user!, req.body);
    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/complaints/:id/status
 */
export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid complaint ID' });
      return;
    }
    const complaint = await complaintsService.updateStatus(id, req.user!, req.body);
    res.json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/complaints/:id/assign
 */
export async function assignComplaint(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid complaint ID' });
      return;
    }
    const complaint = await complaintsService.assignComplaint(id, req.user!, req.body);
    res.json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
}
