/**
 * Regression guard: every state-changing route that requires an admin session
 * must also run verifyCsrf. This scans the route files, so it needs no
 * database. It caught DELETE /newsletter/subscribers/:id, which was missing it.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const routesDir = path.join(__dirname, '..', 'src', 'routes');
const MUTATION = /router\.(post|put|patch|delete)\(/;

test('every authenticated mutation route also uses verifyCsrf', () => {
  const missing = [];
  for (const file of fs.readdirSync(routesDir).filter((f) => f.endsWith('.js'))) {
    const lines = fs.readFileSync(path.join(routesDir, file), 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (MUTATION.test(line) && line.includes('requireAuth') && !line.includes('verifyCsrf')) {
        missing.push(`${file}:${i + 1}  ${line.trim()}`);
      }
    });
  }
  assert.deepEqual(missing, [], `Routes missing verifyCsrf:\n${missing.join('\n')}`);
});
