import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Payload stored inside the JWT token.
 */
export interface JwtPayload {
  userId: number;
  role: 'STUDENT' | 'WARDEN' | 'STAFF' | 'ADMIN';
}

/**
 * Extend Express Request to carry authenticated user info.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware: verify JWT token from Authorization header.
 * Sets req.user on success.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. Provide a Bearer token.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

/**
 * Middleware factory: restrict access to specific roles.
 * Usage: authorize('ADMIN', 'WARDEN')
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'You do not have permission to access this resource.' });
      return;
    }
    next();
  };
}
