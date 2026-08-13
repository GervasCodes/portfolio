/**
 * One-off patch: your database was originally seeded before the seed
 * file's education date was corrected, so the old 2019 date is already
 * sitting in the `experiences` table and a plain `npm run seed` won't
 * touch it (seeding now correctly skips once the DB has data — see
 * scripts/seed.js). This updates that existing row directly.
 *
 * Safe to run more than once: if the row is already correct, it just
 * updates 0 rows.
 *
 * Usage:  node scripts/fix-education-date.js
 */
const mysql = require('mysql2/promise');
const env = require('../src/config/env');

async function run() {
  const connection = await mysql.createConnection({
    host: env.DB_HOST, port: env.DB_PORT, user: env.DB_USER,
    password: env.DB_PASSWORD, database: env.DB_NAME,
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined,
  });

  const [result] = await connection.query(
    `UPDATE experiences
     SET start_date = '2023-10-24', end_date = '2026-07-29', is_current = FALSE
     WHERE type = 'education' AND start_date = '2019-09-01'`
  );

  console.log(
    result.affectedRows > 0
      ? `Fixed ${result.affectedRows} row(s) — education date updated to 2023–2026.`
      : 'No matching row found (either already fixed, or no education row with the old 2019 date exists).'
  );

  await connection.end();
}

run().catch((err) => {
  console.error('Patch failed:', err);
  process.exit(1);
});
