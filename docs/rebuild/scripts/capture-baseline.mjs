// UNTESTED helper. Run locally after `npm run build && npm run preview` in /frontend:
//   npm i -D playwright lighthouse chrome-launcher && npx playwright install chromium
//   node docs/rebuild/scripts/capture-baseline.mjs http://localhost:4173
import { chromium } from 'playwright';
import fs from 'node:fs';

const base = process.argv[2] || 'http://localhost:4173';
const pages = ['/', '/about', '/skills', '/experience', '/projects', '/blog', '/resume', '/contacts', '/search'];
const widths = [375, 768, 1280];
const out = new URL('../screenshots/', import.meta.url).pathname;
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    const name = (p === '/' ? 'home' : p.slice(1).replace(/\//g, '-')) + `-${w}.png`;
    await page.screenshot({ path: out + name, fullPage: true });
  }
  await page.close();
}
await browser.close();
console.log('Screenshots saved to', out);
