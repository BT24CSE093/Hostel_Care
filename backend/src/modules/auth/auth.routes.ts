import { Router } from 'express';
import { z } from 'zod';
import { register, login, getMe } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';

const router = Router();

// ─── Validation Schemas ───────────────────────────────────────

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits').max(15),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'WARDEN', 'STAFF', 'ADMIN']),
  // Optional student fields
  rollNumber: z.string().optional(),
  course: z.string().optional(),
  // Optional staff fields
  staffType: z.enum(['ELECTRICIAN', 'PLUMBER', 'CARPENTER', 'CLEANER', 'GENERAL']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Routes ───────────────────────────────────────────────────

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);

export default router;
