import { Router } from 'express';
import { getAllStaff, getAssignments } from './staff.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', authorize('WARDEN', 'ADMIN'), getAllStaff);
router.get('/:id/assignments', authorize('WARDEN', 'ADMIN', 'STAFF'), getAssignments);

export default router;
