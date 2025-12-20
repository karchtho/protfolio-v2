/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, expect, it } from 'vitest';

import { findById, findByUsername } from '../../repositories/users.repository';

/**
 * Users Repository Tests
 * Tests database operations for users table
 *
 * Prerequisites:
 * - Database must be running (docker-compose up mysql)
 * - Migration 004 must be applied (creates users table + admin user)
 */

describe('Users Repository', () => {
  // Admin user created by migration 004
  const ADMIN_USERNAME = 'admin';
  const ADMIN_ID = 1;

  describe('findByUsername()', () => {
    it('should find existing user by username', async () => {
      const user = await findByUsername(ADMIN_USERNAME);

      expect(user).not.toBeNull();
      expect(user?.id).toBe(ADMIN_ID);
      expect(user?.username).toBe(ADMIN_USERNAME);
      expect(user?.password_hash).toBeDefined();
      expect(user?.password_hash).toMatch(/^\$2b\$/); // bcrypt hash starts with $2b$
      expect(user?.created_at).toBeInstanceOf(Date);
      expect(user?.updated_at).toBeInstanceOf(Date);
    });

    it('should return null for non-existent username', async () => {
      const user = await findByUsername('nonexistent_user');
      expect(user).toBeNull();
    });

    it('should be case-insensitive for username (MySQL default)', async () => {
      const user = await findByUsername('ADMIN'); // Uppercase

      // MySQL avec utf8mb4_general_ci est case-insensitive par défaut
      expect(user).not.toBeNull();
      expect(user?.username).toBe('admin'); // Retourne le username original (lowercase)
    });

    it('should return password_hash (needed for authentication)', async () => {
      const user = await findByUsername(ADMIN_USERNAME);

      expect(user?.password_hash).toBeDefined();
      expect(typeof user?.password_hash).toBe('string');
      expect(user?.password_hash.length).toBeGreaterThan(50); // bcrypt hashes are ~60 chars
    });
  });

  describe('findById()', () => {
    it('should find existing user by ID', async () => {
      const user = await findById(ADMIN_ID);

      expect(user).not.toBeNull();
      expect(user?.id).toBe(ADMIN_ID);
      expect(user?.username).toBe(ADMIN_USERNAME);
      expect(user?.created_at).toBeInstanceOf(Date);
      expect(user?.updated_at).toBeInstanceOf(Date);
    });

    it('should return null for non-existent ID', async () => {
      const user = await findById(99999);
      expect(user).toBeNull();
    });

    it('should NOT return password_hash (UserSafe)', async () => {
      const user = await findById(ADMIN_ID);

      expect(user).not.toBeNull();
      // TypeScript prevents access, but verify at runtime
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((user as any).password_hash).toBeUndefined();
    });

    it('should return UserSafe with only safe fields', async () => {
      const user = await findById(ADMIN_ID);

      expect(user).not.toBeNull();

      // Check that only safe fields are present
      const userKeys = Object.keys(user!);
      expect(userKeys).toContain('id');
      expect(userKeys).toContain('username');
      expect(userKeys).toContain('created_at');
      expect(userKeys).toContain('updated_at');
      expect(userKeys).not.toContain('password_hash');
    });
  });
});
