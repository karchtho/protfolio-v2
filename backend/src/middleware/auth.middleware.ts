import { NextFunction, Request, Response } from 'express';

import * as authService from '../services/auth.service';

  /**
   * Authentication middleware (AuthGuard)
   * Verifies JWT token from Authorization header
   * Attaches user info to req.user if valid
   * Returns 401 if token is missing or invalid
   */
export function authGuard(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided',
      });
      return;
    }

    const token = authHeader.substring(7);
    const payload = authService.verifyToken(token);
    
    if (!payload) {
        res.status(401).json({
            error: 'Authentication failed',
            message: 'Invalid or expired token',
        });
        return;
    }

    req.user = payload;
    next();

} catch {
    res.status(401).json({
        error: 'Authentication failed',
        message: 'Token verification error',
    });
  }
}
