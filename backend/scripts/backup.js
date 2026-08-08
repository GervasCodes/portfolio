/* Dumps the entire application database to a single gzipped .sql file and
   uploads it to Supabase Storage, under a `backups/` prefix in the same
   bucket media already lives in — no extra bucket needs to be provisioned.

   Deliberately dependency-free of the `mysqldump` CLI: Render's runtime
   image isn't guaranteed to ship the MySQL client tools, so this reads the
   schema and data straight over the existing mysql2 connection and writes
   plain SQL (DROP/CREATE/INSERT) by hand. The output is a standard .sql
   file — restoring it is just `gunzip | mysql`.

   Usage:
     node scripts/backup.js
     npm run backup

   Env vars (all optional beyond the existing DB_ and SUPABASE_ config):
     BACKUP_PREFIX            storage folder to upload into (default: "backups")
     BACKUP_RETENTION_COUNT   how many past backups to keep (default: 14)

   Intended to run on a schedule via `.github/workflows/backup.yml`
   (GitHub Actions cron), not as an in-process timer — Render's free/web
   dynos aren't guaranteed to stay awake for an in-process cron to fire,
   whereas GitHub Actions' scheduler runs independently of the app. */

const zlib = require('zlib');
const mysql = require('mysql2/promise');
const env = require('../src/config/env');
const { SupabaseStorageProvider } = require('../src/services/storage.service');

const BACKUP_PREFIX = process.env.BACKUP_PREFIX || 'backups';

// Rows are batched into multi-row INSERTs rather than one INSERT per row —
// far fewer statements for large tables, while staying well clear of
// MySQL's max_allowed_packet on the restore side.
const INSERT_BATCH_SIZE = 500;

function timestampForFilename() {
  // 2026-08-09T14-32-05Z — colon-free so it's a safe filename, and
  // lexicographically sortable, which is what the pruning step relies on.
  return new Date().toISOString().replace(/:/g, '-').replace(/\..+/, 'Z');
}

async function dumpDatabase(connection) {
  const [tables] = await connection.query('SHOW TABLES');
  const tableNames = tables.map((row) => Object.values(row)[0]);

  const chunks = [
    '-- Portfolio CMS database backup\n',
    `-- Generated: ${new Date().toISOString()}\n`,
    `-- Database: ${env.DB_NAME}\n\n`,
    'SET FOREIGN_KEY_CHECKS=0;\n',
    'SET NAMES utf8mb4;\n\n',
  ];

  let totalRows = 0;

  for (const table of tableNames) {
    // Migration bookkeeping table — reconstructing it on restore is
    // actively wrong (a fresh restore should re-run migrations, not
    // inherit the source DB's applied-migrations history).
    if (table === '_migrations') continue;

    const [[{ 'Create Table': createStatement }]] = await connection.query(
      `SHOW CREATE TABLE \`${table}\``
    );

    chunks.push(`-- ----------------------------\n-- Table: ${table}\n-- ----------------------------\n`);
    chunks.push(`DROP TABLE IF EXISTS \`${table}\`;\n`);
    chunks.push(`${createStatement};\n\n`);

    const [rows] = await connection.query(`SELECT * FROM \`${table}\``);
    totalRows += rows.length;

    for (let i = 0; i < rows.length; i += INSERT_BATCH_SIZE) {
      const batch = rows.slice(i, i + INSERT_BATCH_SIZE);
      const columns = Object.keys(batch[0]);
      const columnList = columns.map((c) => `\`${c}\``).join(', ');
      const valueRows = batch
        .map((row) => `(${columns.map((c) => connection.escape(row[c])).join(', ')})`)
        .join(',\n  ');

      chunks.push(`INSERT INTO \`${table}\` (${columnList}) VALUES\n  ${valueRows};\n`);
    }
    chunks.push('\n');
  }

  chunks.push('SET FOREIGN_KEY_CHECKS=1;\n');

  return { sql: chunks.join(''), tableCount: tableNames.length, totalRows };
}

/** Deletes the oldest backups beyond the retention count. Filenames are
 *  timestamp-prefixed and sort lexicographically, so the oldest are
 *  simply the first N once sorted ascending. Reads the retention count
 *  from the environment on each call (rather than caching it once at
 *  module load) so it can be overridden per-call, e.g. in tests. */
async function pruneOldBackups(provider, retentionCount = Number(process.env.BACKUP_RETENTION_COUNT) || 14) {
  const existing = await provider.list(BACKUP_PREFIX);
  const excess = existing.length - retentionCount;
  if (excess <= 0) return 0;

  const toDelete = existing.slice(0, excess); // ascending order = oldest first
  for (const path of toDelete) {
    await provider.remove(path);
  }
  return toDelete.length;
}

async function run() {
  const startedAt = Date.now();
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined,
  });

  try {
    console.log(`[backup] Dumping database "${env.DB_NAME}" from ${env.DB_HOST}...`);
    const { sql, tableCount, totalRows } = await dumpDatabase(connection);

    const gzipped = zlib.gzipSync(Buffer.from(sql, 'utf8'), { level: 9 });
    const filename = `portfolio-backup-${timestampForFilename()}.sql.gz`;
    const path = `${BACKUP_PREFIX}/${filename}`;

    const provider = new SupabaseStorageProvider();
    await provider.upload(gzipped, path, 'application/gzip');

    const prunedCount = await pruneOldBackups(provider);

    const durationMs = Date.now() - startedAt;
    console.log(
      `[backup] Done: ${tableCount} tables, ${totalRows} rows, ` +
        `${(gzipped.length / 1024).toFixed(1)}KB uploaded to "${path}", ` +
        `${prunedCount} old backup(s) pruned, ${durationMs}ms.`
    );
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[backup] Failed:', err.message);
      process.exit(1);
    });
}

module.exports = { pruneOldBackups, timestampForFilename };
