import mysql from 'mysql2/promise';

/**
 * MySQL connection pool using mysql2/promise.
 * Reads all credentials from environment variables — never hardcoded.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'hostelcare_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Return rows as plain objects, not arrays
  // Enable multiple statements only where needed (not globally for security)
});

/**
 * Test the database connection.
 * Returns true if successful, throws on failure.
 */
export async function testConnection(): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    return true;
  } finally {
    connection.release();
  }
}

export default pool;
