import { NextFunction,Request, Response } from 'express';
import { z, ZodError } from 'zod';

/**
 * Generic Zod validation middleware factory
 * Creates middleware that validates req.body against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validateRequest<T extends z.ZodTypeAny>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse and validate req.body with Zod schema
      // If valid, replaces req.body with validated + transformed data
      req.body = await schema.parseAsync(req.body);

      // Validation passed, continue to next middleware/controller
      next();
    } catch (error) {
      // Validation failed
      if (error instanceof ZodError) {
        // Format Zod errors into user-friendly structure
        res.status(400).json({
          error: 'Validation failed',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return; // Explicitly return to satisfy TypeScript
      }

      // Unknown error, pass to error handler
      next(error);
    }
  };
}
