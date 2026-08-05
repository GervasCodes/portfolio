const bcrypt = require('bcryptjs');
const db = require('../config/database');
const env = require('../config/env');

const BCRYPT_ROUNDS = 12;

/**
 * Idempotent admin initializer.
 *
 * On every application startup:
 *  1. Checks whether an admin row already exists for ADMIN_EMAIL.
 *  2. If it does NOT exist, hashes ADMIN_PASSWORD with bcrypt and inserts the row.
 *  3. If it already exists, does nothing (no duplicate, no overwrite).
 *
 * The plain-text ADMIN_PASSWORD is only read from env at boot time and is
 * never stored or logged.  Only the bcrypt hash lands in the database.
 */
async function initializeAdmin() {
  const email = (env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = env.ADMIN_PASSWORD || '';

  if (!email || !password) {
    console.warn(
      '[adminInit] ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin initialization.'
    );
    return;
  }

  try {
    // Check existence first to keep the operation idempotent.
    const rows = await db.query(
      'SELECT id FROM admins WHERE email = ? LIMIT 1',
      [email]
    );

    if (rows.length > 0) {
      console.log('[adminInit] Admin account already exists — skipping creation.');
      return;
    }

    // Hash the plain-text password before any persistence.
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await db.query(
      'INSERT INTO admins (email, password, role) VALUES (?, ?, ?)',
      [email, hash, 'admin']
    );

    console.log(`[adminInit] Admin account created for ${email}.`);
  } catch (err) {
    // A duplicate-key error means another process beat us to it (race-safe).
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('[adminInit] Admin account already exists (concurrent insert) — skipping.');
      return;
    }
    // Any other DB error (e.g. table missing) is logged but must not crash
    // the server — the application can still serve public routes.
    console.error('[adminInit] Failed to initialize admin account:', err.message);
  }
}

module.exports = { initializeAdmin };
