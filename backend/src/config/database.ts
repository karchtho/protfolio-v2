import mysql from 'mysql2/promise';

/**
 * Database configuration from environment variables
 */
const dbConfig = {
  host: process.env.DB_HOST,         // "mysql"
  port: parseInt(process.env.DB_PORT!), // 3306
  user: process.env.DB_USER,         // "portfolio_user"
  password: process.env.DB_PASSWORD, // "SecurePassword123!"
  database: process.env.DB_NAME,     // "portfolio_db"
};

/**
 * MySQL connection pool
 * Reuses connections instead of creating new ones for each query
 */
export const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,      // Max 10 connexions simultanées
  queueLimit: 0,            // Pas de limite de file d'attente
});

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