import { NextFunction,Request, Response } from 'express';
// TODO: Work in progress might implement or not later
/**
 * Custom error class with status code
 * Use this in controllers/services to throw errors with specific HTTP codes
 *
 * Example:
 *   throw new AppError('Project not found', 404);
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  _error: Error | AppError,
  _req: Request,
  _res: Response,
  _next: NextFunction,
): void {

}
