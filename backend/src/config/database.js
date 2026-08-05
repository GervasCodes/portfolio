const mysql = require('mysql2/promise');
const env = require('./env');

/**
 * Database connection manager.
 * Encapsulates pool creation behind a single access point (Singleton-ish),
 * so the rest of the app never touches mysql2 directly.
 */
class Database {
  constructor() {
    this.pool = null;
  }

  connect() {
    if (this.pool) return this.pool;

    this.pool = mysql.createPool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true,
      ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined,
    });

    return this.pool;
  }

  getPool() {
    if (!this.pool) return this.connect();
    return this.pool;
  }

  async query(sql, params = []) {
    const pool = this.getPool();
    // NOTE: intentionally using query() (text protocol) rather than execute()
    // (server-side prepared statements). mysql2's prepared statements reject
    // `?` placeholders used for LIMIT/OFFSET ("Incorrect arguments to
    // mysqld_stmt_execute"), which every paginated query in this app relies
    // on. query() handles it correctly and is what we use everywhere.
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  async testConnection() {
    const pool = this.getPool();
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

// Exported as a singleton instance.
module.exports = new Database();
