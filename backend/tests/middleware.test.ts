import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, authorize } from '../src/middleware/auth.middleware';
import { AppError, errorHandler, notFoundHandler } from '../src/middleware/error.middleware';
import { validate } from '../src/middleware/validate.middleware';
import { z } from 'zod';

describe('Middleware Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, JWT_SECRET: 'test_jwt_secret_key_12345' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Auth Middleware', () => {
    it('should return 401 if Authorization header is missing', () => {
      const req = { headers: {} } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const next = jest.fn() as NextFunction;

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should set req.user and call next() for valid Bearer token', () => {
      const token = jwt.sign({ userId: 1, role: 'STUDENT' }, 'test_jwt_secret_key_12345');
      const req = {
        headers: { authorization: `Bearer ${token}` },
      } as unknown as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      authenticate(req, res, next);

      expect((req as any).user).toEqual(expect.objectContaining({ userId: 1, role: 'STUDENT' }));
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 for invalid token', () => {
      const req = {
        headers: { authorization: 'Bearer invalid.token.here' },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const next = jest.fn() as NextFunction;

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow authorized roles', () => {
      const req = { user: { userId: 2, role: 'WARDEN' } } as unknown as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      const authWardenAdmin = authorize('WARDEN', 'ADMIN');
      authWardenAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 when user does not have allowed role', () => {
      const req = { user: { userId: 1, role: 'STUDENT' } } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const next = jest.fn() as NextFunction;

      const authWardenAdmin = authorize('WARDEN', 'ADMIN');
      authWardenAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Validation Middleware', () => {
    const testSchema = z.object({
      email: z.string().email(),
      age: z.number().int().positive(),
    });

    it('should pass validation when body is valid', () => {
      const req = { body: { email: 'test@example.com', age: 20 } } as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      validate(testSchema)(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 400 when validation fails', () => {
      const req = { body: { email: 'not-an-email', age: -5 } } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const next = jest.fn() as NextFunction;

      validate(testSchema)(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed',
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Error Middleware', () => {
    it('should handle AppError with correct status code and message', () => {
      const err = new AppError('Resource not found', 404);
      const req = {} as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      const next = jest.fn() as NextFunction;

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Resource not found',
      }));
    });

    it('should handle 404 route not found handler', () => {
      const req = { method: 'GET', originalUrl: '/api/unknown' } as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      notFoundHandler(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
