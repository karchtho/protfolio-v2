import express from 'express';

import * as authController from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { loginSchema } from '../validation/auth.validation';

const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 *
 * Body: { username: string, password: string }
 * Response: { token: string, user: UserSafe } | 401
 */
router.post('/login', validateRequest(loginSchema), authController.login);

export default router;