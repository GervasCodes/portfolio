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
  // Access token — deliberately short-lived now that refresh-token rotation
  // handles staying signed in; a leaked access token is only useful for a
  // few minutes.
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',

  // Refresh token — long-lived, rotated on every use, revocable server-side
  // (see database/migrations/008_refresh_tokens.sql). This is what actually
  // keeps the admin signed in across visits; the access token above is not.
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',

  // 2FA (TOTP) — short-lived token issued after password check, exchanged
  // for a full session once a valid authenticator code is supplied.
  MFA_TOKEN_EXPIRES_IN: process.env.MFA_TOKEN_EXPIRES_IN || '5m',
  TOTP_ISSUER: process.env.TOTP_ISSUER || 'Portfolio Admin',

  // Admin credentials — plain-text only in .env during initial setup.
  // The password is hashed with bcrypt on first startup and stored in the
  // database; the plain-text value is never persisted or logged.
  ADMIN_EMAIL: readVar('ADMIN_EMAIL', 'admin@example.com'),
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',

  // Supabase Storage
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET || 'portfolio-media',

  // Email notifications — sent via the Brevo (formerly Sendinblue)
  // transactional email HTTP API instead of raw SMTP. SMTP from Render
  // was failing outright (ETIMEDOUT connecting, then 535 auth failures),
  // and an HTTPS API call is generally more reliable than an SMTP socket
  // from a PaaS host anyway — no port/firewall concerns, no credential
  // rotation via app passwords.
  // Get BREVO_API_KEY from https://app.brevo.com/settings/keys/api
  // BREVO_SENDER_EMAIL must be a sender verified in that Brevo account
  // (Settings -> Senders, Domains & Dedicated IPs -> Senders).
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || '',
  BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME || 'Portfolio',
  CONTACT_RECEIVER_EMAIL: process.env.CONTACT_RECEIVER_EMAIL || process.env.ADMIN_EMAIL || '',

  isProduction() {
    return this.NODE_ENV === 'production';
  },
};

module.exports = env;
