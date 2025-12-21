import { NextFunction, Request, Response } from 'express';

import { LoginCredentials } from '../models/user.model';
import * as authService from '../services/auth.service';

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * @param req
 * @param res
 * @param next
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const credentials: LoginCredentials = req.body;

    const authResponse = await authService.login(credentials);

    if (!authResponse) {
        res.status(401).json({
            error: 'Invalid username or password',
        });
        return;
    }

    res.status(200).json(authResponse)
  } catch (error) {
    next(error);
  }
}
