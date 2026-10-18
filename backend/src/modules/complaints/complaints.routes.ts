import { Router } from 'express';
import { z } from 'zod';
import {
  listComplaints,
  getComplaint,
  createComplaint,
  updateStatus,
  assignComplaint,
} from './complaints.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';

const router = Router();

// All complaint routes require authentication
router.use(authenticate);

// ─── Validation Schemas ───────────────────────────────────────

const createComplaintSchema = z.object({
  hostelId: z.number().int().positive().optional().nullable(),
  roomId: z.number().int().positive('Room ID must be a positive integer').optional().nullable(),
  roomNumber: z.union([z.number(), z.string()]).optional().nullable(),
  categoryId: z.number().int().positive('Category ID must be a positive integer'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum([
    'SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS',
    'RESOLVED', 'CLOSED', 'REJECTED', 'CANCELLED'
  ]),
  remarks: z.string().max(500).optional(),
});

const assignComplaintSchema = z.object({
  staffId: z.number().int().positive('Staff ID must be a positive integer'),
});

// ─── Routes ───────────────────────────────────────────────────

router.get('/', listComplaints);
router.get('/:id', getComplaint);
router.post('/', authorize('STUDENT'), validate(createComplaintSchema), createComplaint);
router.patch('/:id/status', authorize('WARDEN', 'ADMIN', 'STAFF'), validate(updateStatusSchema), updateStatus);
router.post('/:id/assign', authorize('WARDEN', 'ADMIN'), validate(assignComplaintSchema), assignComplaint);

export default router;
