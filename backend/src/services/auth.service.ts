/** Auth service
 * Handles authentication business logic (login, token generation, verification)
 */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { accessTokenOptions, JWT_SECRET } from '../config/jwt.config';
import { AuthResponse, LoginCredentials, UserSafe } from '../models/user.model';
import * as usersRepository from '../repositories/users.repository';

/**
 * JWT payload structure
 * this is what gets encoded inside the token
 */
export interface TokenPayload {
  userId: number;
  username: string;
}

/**
 * Login a user with username and password
 *
 * @param credentials - Username and password
 * @returns AuthResponse with token and user data or null if invalid
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse | null> {
  const user = await usersRepository.findByUsername(credentials.username);

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

  if (!isPasswordValid) {
    return null;
  }

  const token = generateToken(user.id, user.username);

  const userSafe: UserSafe = {
    id: user.id,
    username: user.username,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  return {
    token,
    user: userSafe,
  };
}

/**
 * Generate a JWT access token
 *
 * @param userId
 * @param username
 * @returns Signed JWT token string
 */
function generateToken(userId: number, username: string): string {
  const payload: TokenPayload = {
    userId,
    username,
  };

  return jwt.sign(payload, JWT_SECRET, accessTokenOptions);
}
/**
 * Verify and decode a JWT token
 *
 * @param token - JWT token string
 * @returns Decoded payload with userId, or null if invalid
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decodedRaw = jwt.verify(token, JWT_SECRET, {
      issuer: accessTokenOptions.issuer as jwt.VerifyOptions['issuer'],
      audience: accessTokenOptions.audience as jwt.VerifyOptions['audience'],
    });

    // runtime type narrowing before converting to TokenPayload
    if (typeof decodedRaw !== 'object' || decodedRaw === null) return null;
    const decoded = decodedRaw as Record<string, unknown>;

    if (typeof decoded.userId === 'number' && typeof decoded.username === 'string') {
      return { userId: decoded.userId as number, username: decoded.username as string };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Hash a password (used for creating new users)
 *
 * @param password - Plain text password
 * @returns Hashed password with salt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10; // Cost factor (higher = more secure but slower)
  return bcrypt.hash(password, saltRounds);
}
