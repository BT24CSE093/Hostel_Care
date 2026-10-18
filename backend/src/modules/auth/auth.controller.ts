import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

/**
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 */
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.getMe(req.user!.userId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
