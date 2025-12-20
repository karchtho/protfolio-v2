import mysql from 'mysql2/promise';

import { getSecret } from './secrets.config';

/**
 * Database configuration from environment variables or Docker secrets
 */
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: getSecret('db_user', 'DB_USER'),
  password: getSecret('db_password', 'DB_PASSWORD'),
  database: getSecret('db_name', 'DB_NAME'),
};

/**
 * MySQL connection pool
 * Reuses connections instead of creating new ones for each query
 */
export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // TODO: chekc if really safe before prod
})

/**
 * Test database connection with retry logic
 */
export async function testConnection(): Promise<void> {
  const maxRetries = 30;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Database connected successfully');
      connection.release();
      return;
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        console.error('❌ Database connection failed after', maxRetries, 'attempts:', error);
        throw error;
      }
      const delayMs = Math.min(1000 * Math.pow(1.5, attempt - 1), 10000); // Exponential backoff, max 10s
      console.log(`⏳ Database not ready, retrying in ${Math.round(delayMs)}ms (attempt ${attempt}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}