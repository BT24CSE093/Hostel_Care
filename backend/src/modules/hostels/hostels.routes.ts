import { Router } from 'express';
import { getAllHostels, getRoomsByHostelId, getAllCategories } from './hostels.controller';

const router = Router();

// Public routes — no authentication required for listing hostels/categories
router.get('/', getAllHostels);
router.get('/categories', getAllCategories);  // GET /api/complaint-categories also maps here
router.get('/:id/rooms', getRoomsByHostelId);

export default router;
