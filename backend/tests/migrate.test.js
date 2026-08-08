const test = require('node:test');
const assert = require('node:assert/strict');

// Requiring the script must not trigger an actual migration run — guarded
// behind `require.main === module`, same pattern as scripts/backup.js.
const { splitStatements } = require('../scripts/migrate.js');

test('splitStatements ignores a semicolon inside a `--` comment', () => {
  const sql = `
    -- note: this comment has a semicolon; right here
    CREATE TABLE foo (id INT);
  `;
  const statements = splitStatements(sql);
  assert.equal(statements.length, 1);
  assert.match(statements[0], /^CREATE TABLE foo/);
  assert.ok(!statements[0].includes('--'), 'comment text must not leak into the statement');
});

test('splitStatements ignores a semicolon inside a quoted string literal', () => {
  const sql = `
    ALTER TABLE admins
      ADD COLUMN note VARCHAR(255) COMMENT 'set during setup; cleared on disable';
  `;
  const statements = splitStatements(sql);
  assert.equal(statements.length, 1);
  assert.match(statements[0], /COMMENT 'set during setup; cleared on disable'/);
});

test('splitStatements handles an escaped quote inside a string literal', () => {
  const sql = `INSERT INTO foo (name) VALUES ('it\\'s fine; really');`;
  const statements = splitStatements(sql);
  assert.equal(statements.length, 1);
  assert.match(statements[0], /it\\'s fine; really/);
});

test('splitStatements handles a doubled quote inside a string literal', () => {
  const sql = `INSERT INTO foo (name) VALUES ('it''s fine; really');`;
  const statements = splitStatements(sql);
  assert.equal(statements.length, 1);
  assert.match(statements[0], /it''s fine; really/);
});

test('splitStatements splits multiple real statements correctly', () => {
  const sql = `
    -- header comment
    CREATE TABLE a (id INT);
    CREATE TABLE b (id INT);
  `;
  const statements = splitStatements(sql);
  assert.equal(statements.length, 2);
  assert.match(statements[0], /^CREATE TABLE a/);
  assert.match(statements[1], /^CREATE TABLE b/);
});

test('splitStatements drops a trailing comment-only tail with no statement', () => {
  const sql = `
    CREATE TABLE a (id INT);
    -- trailing note, no more SQL after this
  `;
  const statements = splitStatements(sql);
  assert.equal(statements.length, 1);
  assert.match(statements[0], /^CREATE TABLE a/);
});
