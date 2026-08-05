require('dotenv').config();

/**
 * Centralized, validated environment configuration.
 * Every other module reads config from here instead of
 * touching `process.env` directly (Separation of Concerns).
 */
function readVar(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    console.warn(`[env] Missing environment variable: ${name}`);
  }
  return value;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  // Aiven MySQL
  DB_HOST: readVar('DB_HOST', 'localhost'),
  DB_PORT: Number(process.env.DB_PORT) || 3306,
  DB_NAME: readVar('DB_NAME', 'portfolio'),
  DB_USER: readVar('DB_USER', 'root'),
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_SSL: process.env.DB_SSL !== 'false', // Aiven requires SSL by default

  // Auth
  JWT_SECRET: readVar('JWT_SECRET', 'dev-secret-change-me'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ADMIN_EMAIL: readVar('ADMIN_EMAIL', 'admin@example.com'),
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH || '',

  // Supabase Storage
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET || 'portfolio-media',

  // Email notifications
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  CONTACT_RECEIVER_EMAIL: process.env.CONTACT_RECEIVER_EMAIL || process.env.ADMIN_EMAIL || '',

  isProduction() {
    return this.NODE_ENV === 'production';
  },
};

module.exports = env;
