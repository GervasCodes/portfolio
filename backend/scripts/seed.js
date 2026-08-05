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
