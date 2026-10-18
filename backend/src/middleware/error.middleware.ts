import { Request, Response, NextFunction } from 'express';

/**
 * Custom application error with HTTP status code.
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * 404 handler — catches requests to undefined routes.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

/**
 * Centralized error handler.
 * - Returns consistent JSON error responses.
 * - Hides internal stack traces in production.
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Default to 500 for unexpected errors
  const statusCode = (err as AppError).statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log the error (but never log sensitive data)
  console.error(`[ERROR] ${err.message}`);
  if (!isProduction && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && isProduction
      ? 'Internal server error'
      : err.message,
    // Only include stack in development
    ...((!isProduction && err.stack) ? { stack: err.stack } : {}),
  });
}
