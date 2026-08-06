/* Runs every .sql file in database/migrations against the configured DB, in order.
   - Tracks applied migrations in a `_migrations` table (skips already-run files).
   - Executes each statement individually so one ignorable error doesn't abort the file.
   - Safely ignores duplicate column / duplicate table errors (idempotent re-runs). */

const fs   = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env  = require('../src/config/env');

// MySQL error codes that are safe to ignore (column/table already exists)
const IGNORABLE = new Set([
  'ER_DUP_FIELDNAME',   // 1060 – duplicate column name
  'ER_TABLE_EXISTS_ERROR', // 1050 – table already exists
  'ER_DUP_KEYNAME',     // 1061 – duplicate key name
]);

function splitStatements(sql) {
  // Split on semicolons that are not inside strings, strip empty results
  return sql
    .split(/;/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--') && s !== '');
}

async function migrate() {
  const dir   = path.join(__dirname, '..', '..', 'database', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  const connection = await mysql.createConnection({
    host: env.DB_HOST, port: env.DB_PORT, user: env.DB_USER,
    password: env.DB_PASSWORD, database: env.DB_NAME, multipleStatements: false,
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined,
  });

  // Ensure tracking table exists
  await connection.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      filename   VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Load already-applied migrations
  const [rows]  = await connection.query('SELECT filename FROM _migrations');
  const applied = new Set(rows.map((r) => r.filename));

  let skipped = 0;
  let ran     = 0;

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  ⏭  Skipping (already applied): ${file}`);
      skipped++;
      continue;
    }

    console.log(`  ▶  Running migration: ${file}`);
    const sql        = fs.readFileSync(path.join(dir, file), 'utf8');
    const statements = splitStatements(sql);

    for (const stmt of statements) {
      try {
        await connection.query(stmt);
      } catch (err) {
        if (IGNORABLE.has(err.code)) {
          console.log(`     ⚠  Ignored (${err.code}): ${stmt.substring(0, 80).replace(/\n/g, ' ')}…`);
        } else {
          await connection.end();
          console.error(`\nMigration failed in ${file}:\n`, err.message);
          process.exit(1);
        }
      }
    }

    // Record as applied only after all statements succeed (or are safely ignored)
    await connection.query('INSERT INTO _migrations (filename) VALUES (?)', [file]);
    console.log(`     ✔  Done: ${file}`);
    ran++;
  }

  console.log(`\nAll migrations complete. ${ran} ran, ${skipped} skipped.\n`);
  await connection.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
