/**
 * User model - Admin authentication
 */
export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * User without sensitive data (for API responses)
 * Never send the password_hash to the client!
*/
export interface UserSafe {
  id: number;
  username: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Auth response with JWT token
 */
export interface AuthResponse {
  token: string;
  user: UserSafe;
}
