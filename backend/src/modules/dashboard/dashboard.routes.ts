import { Router } from 'express';
import { getSummary, getComplaintsByStatus, getComplaintsByCategory } from './dashboard.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();

// Dashboard is accessible to WARDEN and ADMIN
router.use(authenticate);
router.use(authorize('WARDEN', 'ADMIN'));

router.get('/summary', getSummary);
router.get('/complaints-by-status', getComplaintsByStatus);
router.get('/complaints-by-category', getComplaintsByCategory);

export default router;
