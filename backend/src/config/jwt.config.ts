import type { SignOptions } from 'jsonwebtoken';

import { getSecret } from './secrets.config';

/**
 * JWT configuration
 * Centralized configuration for JSON web token settings
 */

/**
 * JWT secret (for signing and verifying)
 */
export const JWT_SECRET = getSecret('jwt_secret', 'JWT_SECRET');

/**
 * Sign options for access tokens
 * Used directly with jwt.sign()
 */
export const accessTokenOptions: SignOptions = {
  expiresIn: '1h',
  issuer: 'karcherthomas.com',
  audience: 'karcherthomas.com',
};

/**
 * Sign options for refresh tokens (future use)
 */
export const refreshTokenOptions: SignOptions = {
  expiresIn: '7d',
  issuer: 'karcherthomas.com',
  audience: 'karcherthomas.com',
};
