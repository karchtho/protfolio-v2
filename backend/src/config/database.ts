import mysql from 'mysql2/promise';

import { getSecret } from './secrets';

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
 * Test database connection
 */
export async function testConnection(): Promise<void> {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}