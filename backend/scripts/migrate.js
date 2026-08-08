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
  // A small character-scan, not a full SQL tokenizer — but real SQL
  // tokenization is what's actually needed here. A semicolon is only a
  // statement terminator when it's not inside a `--` comment AND not
  // inside a quoted string literal:
  //   -- a semicolon in a comment, e.g. "cookie); `ip_address`"
  //   COMMENT 'base32 secret; set during setup'  -- a semicolon in a string
  // Splitting on `;` first (the original approach) or stripping comments
  // line-by-line without string-awareness (this function's first fix)
  // both mis-split cases like these — the comment/string tail then
  // slips through as its own "statement" and gets sent to MySQL as
  // invalid SQL.
  const statements = [];
  let current = '';
  let inString = null; // null, or the quote char (' or ") currently open

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (inString) {
      current += ch;
      if (ch === inString) {
        if (next === inString) {
          // Escaped quote via doubling ('' or ""): consume both, stay in string.
          current += next;
          i++;
        } else {
          inString = null;
        }
      } else if (ch === '\\' && next !== undefined) {
        // Backslash-escape (MySQL's default sql_mode): consume the next
        // char as literal so a `\'` doesn't end the string early.
        current += next;
        i++;
      }
      continue;
    }

    if (ch === "'" || ch === '"') {
      inString = ch;
      current += ch;
      continue;
    }

    if (ch === '-' && next === '-') {
      // Line comment: skip to (but not past) the next newline.
      while (i < sql.length && sql[i] !== '\n') i++;
      continue;
    }

    if (ch === ';') {
      statements.push(current);
      current = '';
      continue;
    }

    current += ch;
  }
  if (current.trim()) statements.push(current);

  return statements.map((s) => s.trim()).filter((s) => s.length > 0);
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

if (require.main === module) {
  migrate().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

module.exports = { splitStatements };
