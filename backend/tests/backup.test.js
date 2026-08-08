const test = require('node:test');
const assert = require('node:assert/strict');

// Requiring the script must not trigger an actual backup run (no DB /
// Supabase connection here) — scripts/backup.js guards its `run()` call
// behind `require.main === module` for exactly this reason.
const { pruneOldBackups, timestampForFilename } = require('../scripts/backup.js');

/** Minimal fake StorageProvider — just enough of `list`/`remove` for
 *  pruneOldBackups to exercise, without touching Supabase or the network. */
function fakeProvider(existingPaths) {
  const removed = [];
  return {
    async list(_prefix) {
      return [...existingPaths];
    },
    async remove(path) {
      removed.push(path);
    },
    removed,
  };
}

test('pruneOldBackups keeps everything when under the retention count', async () => {
  const provider = fakeProvider(['backups/a.sql.gz', 'backups/b.sql.gz']);
  const deletedCount = await pruneOldBackups(provider, 5);
  assert.equal(deletedCount, 0);
  assert.deepEqual(provider.removed, []);
});

test('pruneOldBackups deletes only the oldest entries beyond the retention count', async () => {
  const existing = [
    'backups/2026-08-01T00-00-00Z.sql.gz',
    'backups/2026-08-02T00-00-00Z.sql.gz',
    'backups/2026-08-03T00-00-00Z.sql.gz',
    'backups/2026-08-04T00-00-00Z.sql.gz',
  ];
  const provider = fakeProvider(existing);
  const deletedCount = await pruneOldBackups(provider, 2);
  assert.equal(deletedCount, 2);
  assert.deepEqual(provider.removed, [
    'backups/2026-08-01T00-00-00Z.sql.gz',
    'backups/2026-08-02T00-00-00Z.sql.gz',
  ]);
});

test('timestampForFilename produces a colon-free, sortable timestamp', () => {
  const ts = timestampForFilename();
  assert.ok(!ts.includes(':'), 'expected no colons (must be a safe filename)');
  assert.match(ts, /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z$/);
});
