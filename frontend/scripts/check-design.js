// Fails if a banned "template look" class or pattern comes back into the
// source. Run with `npm run check:design`; intended for CI (Phase 11).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const BANNED = [
  [/\bglass(-hover)?\b/, 'glass surface classes (use .surface / .card)'],
  [/card-premium/, 'card-premium (use .card)'],
  [/text-gradient/, 'gradient text'],
  [/bg-gradient-to|from-accent|to-cyan|via-/, 'gradient backgrounds'],
  [/shadow-glow|shadow-\[/, 'glow / arbitrary shadows (only shadow-overlay is allowed)'],
  [/backdrop-blur|\bblur-\[/, 'blur effects'],
  [/animate-(float|shine|ping|bounce)/, 'decorative looping animations'],
  [/bg-noise/, 'noise texture'],
  [/cyan-accent|accent-dark|accent-light|accent-glow/, 'old palette tokens'],
  [/pexels\.com/, 'stock photography'],
];

const ROOT = new URL('../src/', import.meta.url).pathname;
// The styleguide documents tokens by name and is dev-only.
const SKIP = new Set(['pages/dev/StyleguidePage.jsx']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (['.jsx', '.js', '.css'].includes(extname(p))) out.push(p);
  }
  return out;
}

let failures = 0;
for (const file of walk(ROOT)) {
  const rel = file.slice(ROOT.length);
  if (SKIP.has(rel)) continue;
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    for (const [re, why] of BANNED) {
      if (re.test(line)) {
        failures += 1;
        console.error(`${rel}:${i + 1}  ${why}\n    ${line.trim().slice(0, 140)}`);
      }
    }
  });
}

if (failures) {
  console.error(`\n${failures} banned design pattern(s) found.`);
  process.exit(1);
}
console.log('check:design passed: no banned design patterns found.');
