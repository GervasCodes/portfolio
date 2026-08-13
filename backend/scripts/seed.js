/* Runs every .sql file in database/seeds against the configured DB, in order. */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('../src/config/env');

async function seed() {
  const dir = path.join(__dirname, '..', '..', 'database', 'seeds');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  const connection = await mysql.createConnection({
    host: env.DB_HOST, port: env.DB_PORT, user: env.DB_USER,
    password: env.DB_PASSWORD, database: env.DB_NAME, multipleStatements: true,
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined,
  });

  // profiles/skills/experiences have no unique constraints, so re-running
  // the seed would silently duplicate them (and re-running always fails
  // partway through anyway, once projects.slug already exists from a
  // previous run). Treat seeding as a one-time, fresh-database action:
  // if there's already a profile row, the DB has been seeded before —
  // skip instead of erroring or duplicating data.
  const [[{ count }]] = await connection.query('SELECT COUNT(*) AS count FROM profiles');
  if (count > 0) {
    console.log('Database already contains data — skipping seed (safe to ignore on repeat runs).');
    await connection.end();
    return;
  }

  for (const file of files) {
    console.log(`Running seed: ${file}`);
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    await connection.query(sql);
  }

  console.log('Seed data inserted.');
  await connection.end();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
