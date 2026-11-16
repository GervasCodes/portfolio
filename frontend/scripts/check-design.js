// Design guard for the v2 "editorial-tech, dark-first" system.
//   npm run check:design              -> fail on banned patterns + failing contrast
//   npm run check:design -- --report  -> also print the full contrast table (markdown)
//
// What it enforces (see docs/rebuild/03-design-system.md):
//   1. No stock photography.
//   2. No text-gradient on body copy; accent gradients only in the 3 allowed places.
//   3. No decorative looping animations other than the one ambient effect
//      (+ functional spinner / skeleton / marquee).
//   4. One accent hue only: no Tailwind palette colours, no hard-coded colours
//      outside src/styles/tokens.css, and the accent tokens must stay in the
//      orange-amber hue band.
//   5. Glass only on the navbar and the command palette.
//   6. Motion stays within 150-600 ms.
//   7. WCAG 2.2 contrast for every text/background pair, recomputed from tokens.css.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = new URL('../src/', import.meta.url).pathname;
const TOKENS = 'styles/tokens.css';
const REPORT = process.argv.includes('--report');

/* ------------------------------------------------------------------ patterns */
const PALETTE = '(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)';
const UTIL = '(?:bg|text|border|ring|fill|stroke|from|via|to|divide|outline|shadow|decoration|accent|caret)';

const BANNED = [
  [/pexels\.com|unsplash\.com|images\.unsplash|picsum\.photos|placeholder\.com/i, 'stock / placeholder photography'],
  [/card-premium|bg-noise|accent-glow|accent-dark|accent-light|cyan-accent/, 'retired v1 class or token names'],
  [/animate-(float|shine|ping|bounce|pulse|wiggle|blink)\b/, 'decorative looping animation (only the ambient effect, spinner, skeleton and marquee may loop)'],
  [/\bduration-(\[|[7-9]\d\d\b|\d{4,})/, 'motion longer than 600 ms'],
  [new RegExp(`\\b${UTIL}-${PALETTE}-\\d{2,3}\\b`), 'Tailwind palette colour (use a token: accent, ink, muted, danger...)'],
  [/\b(?:bg|text|border|ring|fill|stroke|from|via|to|shadow|divide)-(?:white|black)\b/, 'raw white/black (use ink, bg, surface, scrim or on-scrim tokens)'],
  [/\b[a-z-]+-\[#[0-9a-fA-F]{3,8}\]/, 'arbitrary hex colour'],
  [/\bshadow-\[/, 'arbitrary shadow (use shadow-card / lift / overlay / glow)'],
  [/\bblur-\[|\bdrop-shadow-/, 'blur / drop-shadow outside the allowed glass + glow'],
];

// JSX/JS only: gradient utilities and inline gradients must not leak into components.
const BANNED_JS = [
  [/\b(?:bg-gradient-to-\w+|(?:from|via|to)-(?:accent|ink|bg|surface|muted|transparent|danger|success|warning|line|control|scrim|\[))[\w/[\]-]*/, 'gradient utility classes (gradients live in index.css: .glow-hero, .btn-primary, .wordmark)'],
  [/linear-gradient\(|radial-gradient\(|conic-gradient\(/, 'inline gradient in a component (use the .glow-hero / .wordmark utilities)'],
  [/text-gradient|bg-clip-text/, 'gradient text (only the footer .wordmark may use it)'],
];

// CSS: hard-coded colours (outside tokens.css) and gradient guard rails.
const BANNED_CSS = [
  [/#[0-9a-fA-F]{3,8}\b(?![^()]*\))/, 'hex colour literal (use tokens)'],
  [/\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(\s*(?!var\()[\d.]/, 'colour literal (use rgb(var(--token)))'],
  [/(?:^|[\s:,])(?:white|black|red|green|blue|purple|violet|cyan|magenta|pink|orange|yellow)(?=[\s;,)])/i, 'named colour (use tokens)'],
  [/gradient\([^)]*(?:purple|violet|indigo|cyan|fuchsia|magenta|blue|teal)/i, 'purple/cyan "AI template" gradient'],
];

// Where each exception is allowed. Paths are relative to src/.
const GLASS_FILES = [/^components\/layout\/Navbar\.jsx$/, /^components\/(layout|ui|search)\/CommandPalette/];
const BACKDROP = /backdrop-blur|backdrop-filter|\bglass\b/;
// CSS gradients are allowed only on these selectors (hero glow, primary CTA hover,
// footer wordmark) and for functional surfaces (spotlight, marquee/scrollbar masks).
const CSS_GRADIENT_OK = /(glow-hero|btn-primary|wordmark|spotlight|marquee|mask)/;
// Files skipped entirely: the styleguide documents tokens by name and is dev-only.
const SKIP = new Set(['pages/dev/StyleguidePage.jsx']);

/* ---------------------------------------------------------------- file walk */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (['.jsx', '.js', '.css'].includes(extname(p))) out.push(p);
  }
  return out;
}

let failures = 0;
const fail = (rel, i, why, line) => {
  failures += 1;
  console.error(`${rel}${i ? `:${i}` : ''}  ${why}${line ? `\n    ${line.trim().slice(0, 150)}` : ''}`);
};

for (const file of walk(ROOT)) {
  const rel = file.slice(ROOT.length);
  if (SKIP.has(rel)) continue;
  const isCss = rel.endsWith('.css');
  const isTokens = rel === TOKENS;
  const lines = readFileSync(file, 'utf8').split('\n');
  let inBlockComment = false;
  let selector = '';

  lines.forEach((raw, idx) => {
    const i = idx + 1;
    let line = raw;
    // Strip comments so documentation can mention banned things.
    if (inBlockComment) {
      if (line.includes('*/')) { line = line.slice(line.indexOf('*/') + 2); inBlockComment = false; } else return;
    }
    line = line.replace(/\/\*.*?\*\//g, '');
    if (line.includes('/*')) { line = line.slice(0, line.indexOf('/*')); inBlockComment = true; }
    if (!isCss) line = line.replace(/(^|[^:])\/\/.*$/, '$1');
    if (!line.trim()) return;

    if (isCss && line.includes('{')) selector = line.split('{')[0].trim() || selector;

    for (const [re, why] of BANNED) if (re.test(line)) fail(rel, i, why, raw);
    if (BACKDROP.test(line) && !GLASS_FILES.some((r) => r.test(rel)) && !(isCss && rel === 'index.css')) {
      fail(rel, i, 'glass / backdrop blur is allowed only on the floating navbar and the command palette', raw);
    }
    if (!isCss) for (const [re, why] of BANNED_JS) if (re.test(line)) fail(rel, i, why, raw);
    if (isCss && !isTokens) {
      for (const [re, why] of BANNED_CSS) if (re.test(line)) fail(rel, i, why, raw);
      if (/gradient\(/.test(line) && !CSS_GRADIENT_OK.test(selector) && !CSS_GRADIENT_OK.test(line)) {
        fail(rel, i, 'gradient outside the allowed places (hero glow, primary CTA hover, footer wordmark, spotlight)', raw);
      }
      // Durations literal > 600ms in CSS (tokens cover 150-600).
      const ms = [...line.matchAll(/(\d+(?:\.\d+)?)(ms|s)\b(?![-\w])/g)];
      for (const [, n, unit] of ms) {
        const v = unit === 's' ? Number(n) * 1000 : Number(n);
        if (/(transition|animation|duration)/.test(line) && !/infinite|ambient|marquee|skeleton|pulse/.test(line) && v > 600) {
          fail(rel, i, 'transition longer than 600 ms', raw);
        }
      }
    }
  });
}

/* ------------------------------------------------------- tokens + contrast */
const css = readFileSync(join(ROOT, TOKENS), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

function block(selectorRe) {
  const m = css.match(new RegExp(`${selectorRe}\\s*\\{([^}]*)\\}`));
  return m ? m[1] : '';
}
function parseVars(body) {
  const out = {};
  for (const [, k, v] of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) out[k] = v.trim();
  return out;
}
const chan = (v) => v.trim().split(/\s+/).map(Number);

const dark = parseVars(block(String.raw`:root,\s*\[data-theme='dark'\]`));
const light = { ...dark, ...parseVars(block(String.raw`\[data-theme='light'\]`)) };

const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => { const [hi, lo] = lum(a) > lum(b) ? [a, b] : [b, a]; return (lum(hi) + 0.05) / (lum(lo) + 0.05); };
const mix = (fg, bg, a) => fg.map((c, i) => c * a + bg[i] * (1 - a));
const hex = (c) => `#${c.map((x) => Math.round(x).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
const hue = ([r, g, b]) => {
  const [R, G, B] = [r, g, b].map((x) => x / 255);
  const max = Math.max(R, G, B); const min = Math.min(R, G, B); const d = max - min;
  if (!d) return 0;
  const h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return (h * 60 + 360) % 360;
};

// [foreground, background, minimum, note]. Text: 4.5 (normal) ; UI/non-text: 3.
const PAIRS = (t) => {
  const c = (k) => chan(t[k]);
  const tint = (bgKey) => mix(c('accent'), c(bgKey), Number(t['tint-alpha']));
  return [
    ['text on bg', c('text'), c('bg'), 4.5],
    ['text on surface', c('text'), c('surface'), 4.5],
    ['text on surface-2', c('text'), c('surface-2'), 4.5],
    ['muted on bg', c('muted'), c('bg'), 4.5],
    ['muted on surface', c('muted'), c('surface'), 4.5],
    ['muted on surface-2', c('muted'), c('surface-2'), 4.5],
    ['accent (links, labels) on bg', c('accent'), c('bg'), 4.5],
    ['accent on surface', c('accent'), c('surface'), 4.5],
    ['accent on surface-2', c('accent'), c('surface-2'), 4.5],
    ['accent on accent tint (Tag)', c('accent'), tint('bg'), 4.5],
    ['accent-ink on accent (button text)', c('accent-ink'), c('accent'), 4.5],
    ['accent-ink on accent-2 (button hover end)', c('accent-ink'), c('accent-2'), 4.5],
    ['danger on bg', c('danger'), c('bg'), 4.5],
    ['danger on surface', c('danger'), c('surface'), 4.5],
    ['success on bg', c('success'), c('bg'), 4.5],
    ['success on surface', c('success'), c('surface'), 4.5],
    ['warning on bg', c('warning'), c('bg'), 4.5],
    ['warning on surface', c('warning'), c('surface'), 4.5],
    ['accent-ink on danger (danger button hover)', c('accent-ink'), c('danger'), 4.5],
    ['control border on surface (non-text)', c('control'), c('surface'), 3],
    ['control border on bg (non-text)', c('control'), c('bg'), 3],
    ['focus ring: accent on bg (non-text)', c('accent'), c('bg'), 3],
    ['focus ring: accent on surface (non-text)', c('accent'), c('surface'), 3],
    ['on-scrim on scrim 85% over bg (lightbox)', c('on-scrim'), mix(c('scrim'), c('bg'), 0.85), 4.5],
    ['accent-2 on bg (footer wordmark, large text)', c('accent-2'), c('bg'), 3],
  ];
};

const rows = [];
for (const [name, t] of [['dark', dark], ['light', light]]) {
  for (const [label, fg, bg, min] of PAIRS(t)) {
    const r = ratio(fg, bg);
    const ok = r >= min;
    rows.push({ theme: name, label, fg: hex(fg), bg: hex(bg), r, min, ok });
    if (!ok) fail(TOKENS, 0, `${name}: ${label} is ${r.toFixed(2)}:1, needs ${min}:1 (${hex(fg)} on ${hex(bg)})`);
  }
}

// One accent hue: accent tokens must stay in the orange-amber band.
for (const [name, t] of [['dark', dark], ['light', light]]) {
  for (const k of ['accent', 'accent-2']) {
    const h = hue(chan(t[k]));
    if (h < 5 || h > 45) fail(TOKENS, 0, `${name}: --${k} hue ${h.toFixed(0)} deg is outside the single orange-amber accent band (5-45)`);
  }
}
// No extra colour tokens may appear unnoticed.
const ALLOWED_COLOUR_TOKENS = new Set(['bg', 'surface', 'surface-2', 'line', 'control', 'text', 'muted', 'accent', 'accent-ink', 'accent-2', 'danger', 'success', 'warning', 'scrim', 'on-scrim']);
for (const [k, v] of Object.entries(dark)) {
  if (/^\d+ \d+ \d+$/.test(v) && !ALLOWED_COLOUR_TOKENS.has(k)) fail(TOKENS, 0, `unexpected colour token --${k} (the palette is closed; add it to the design system doc and this list first)`);
}

if (REPORT) {
  console.log('| Theme | Pair | Colours | Ratio | Needs | |');
  console.log('|---|---|---|---|---|---|');
  for (const r of rows) console.log(`| ${r.theme} | ${r.label} | ${r.fg} on ${r.bg} | ${r.r.toFixed(2)}:1 | ${r.min}:1 | ${r.ok ? 'pass' : 'FAIL'} |`);
}

if (failures) {
  console.error(`\n${failures} design rule violation(s) found.`);
  process.exit(1);
}
console.log(`check:design passed: no banned patterns, ${rows.length} contrast pairs verified (dark + light), single accent hue.`);
