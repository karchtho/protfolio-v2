/**
 * Users repository
 * Handles database connection
 */
import { RowDataPacket } from 'mysql2';

import { pool } from '../config/database.config';
import { User, UserSafe } from "../models/user.model";
/**
 * Database row type for users table
 */
interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Find a user by username (returns full User with password hash)
 * Used for authentication (need password to compare)
 *
 * @param username - User username address
 * @returns User object with password hash, or null if not found
 */
export async function findByUsername(username: string): Promise<User | null> {
  const [rows] = await pool.query<UserRow[]>(
    'SELECT id, username, password_hash, created_at, updated_at FROM users WHERE username = ?',
    [username],
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  return {
    id: row.id,
    username: row.username,
    password_hash: row.password_hash,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Find a user by ID (returns Usersafe without password hash)
 * Used for token validation
 *
 * @param id - User ID
 * @returns UserSafe object or null if not found
 */
export async function findById(id: number): Promise<UserSafe | null> {
  const [rows] = await pool.query<UserRow[]>(
    'SELECT id, username, created_at, updated_at FROM users WHERE id = ?',
    [id],
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  return {
    id: row.id,
    username: row.username,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
