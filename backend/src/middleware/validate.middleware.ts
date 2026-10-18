import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware factory: validate request body against a Zod schema.
 * Returns 400 with detailed validation errors on failure.
 *
 * Usage:
 *   router.post('/endpoint', validate(myZodSchema), controller.handler);
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Parse and replace req.body with validated/transformed data
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
}
