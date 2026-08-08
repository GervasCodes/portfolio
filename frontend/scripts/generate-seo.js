#!/usr/bin/env node
/**
 * Build-time SEO generator.
 *
 * Runs before `vite build` (see the "build" script in package.json) and
 * writes two static files into public/ so they end up in the final
 * dist/ output at the site root:
 *
 *   - sitemap.xml  — static routes + every published project/blog slug,
 *                     fetched live from the backend API.
 *   - robots.txt   — allows crawling of public routes, disallows /admin,
 *                     and points crawlers at the sitemap.
 *
 * This is a build-time snapshot, not a live endpoint: new content only
 * appears in the sitemap after the next deploy. That's an intentional
 * trade-off for a static Vite/Vercel SPA — the alternative (a Vercel
 * serverless function serving these dynamically) is a reasonable
 * follow-up if slug freshness between deploys becomes a problem, but
 * adds routing complexity this phase doesn't need. In the meantime,
 * publishing new content from the admin dashboard and redeploying
 * keeps the sitemap accurate.
 *
 * Never throws hard on network failure — a missing sitemap should not
 * block a deploy, so on any API error this falls back to static routes
 * only and logs a warning.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadDotEnvIfPresent();

const API_URL = (process.env.VITE_API_URL || 'https://portfolio-backend-7o3j.onrender.com').replace(/\/+$/, '');
const SITE_URL = (process.env.VITE_SITE_URL || 'https://example.com').replace(/\/+$/, '');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Public, indexable routes that aren't tied to dynamic content.
const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/skills', changefreq: 'monthly', priority: '0.6' },
  { path: '/experience', changefreq: 'monthly', priority: '0.6' },
  { path: '/projects', changefreq: 'weekly', priority: '0.9' },
  { path: '/blog', changefreq: 'weekly', priority: '0.9' },
  { path: '/resume', changefreq: 'monthly', priority: '0.5' },
  { path: '/contacts', changefreq: 'yearly', priority: '0.5' },
];

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.json();
}

async function fetchProjectSlugs() {
  try {
    const json = await fetchJson(`${API_URL}/api/projects?limit=1000&page=1`);
    return (json.data || []).map((p) => ({ slug: p.slug, updated_at: p.updated_at }));
  } catch (err) {
    console.warn(`[generate-seo] Could not fetch projects, skipping project URLs: ${err.message}`);
    return [];
  }
}

async function fetchBlogSlugs() {
  try {
    const json = await fetchJson(`${API_URL}/api/blog?limit=1000&page=1`);
    return (json.data || []).map((p) => ({ slug: p.slug, updated_at: p.published_at }));
  } catch (err) {
    console.warn(`[generate-seo] Could not fetch blog posts, skipping blog URLs: ${err.message}`);
    return [];
  }
}

function xmlEscape(str) {
  return String(str).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

function urlEntry(loc, { changefreq, priority, lastmod } = {}) {
  const parts = [`  <url>`, `    <loc>${xmlEscape(loc)}</loc>`];
  if (lastmod) parts.push(`    <lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>`);
  if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority) parts.push(`    <priority>${priority}</priority>`);
  parts.push(`  </url>`);
  return parts.join('\n');
}

function buildSitemap(projectSlugs, blogSlugs) {
  const urls = [
    ...STATIC_ROUTES.map((r) => urlEntry(`${SITE_URL}${r.path}`, r)),
    ...projectSlugs.map((p) =>
      urlEntry(`${SITE_URL}/projects/${p.slug}`, { changefreq: 'monthly', priority: '0.7', lastmod: p.updated_at })
    ),
    ...blogSlugs.map((p) =>
      urlEntry(`${SITE_URL}/blog/${p.slug}`, { changefreq: 'monthly', priority: '0.7', lastmod: p.updated_at })
    ),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

function buildRobots() {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /admin/',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n');
}

function loadDotEnvIfPresent() {
  // Vite only loads .env into import.meta.env for its own dev/build
  // process, not for plain `node` scripts like this one. On Vercel this
  // doesn't matter (env vars are already in process.env at build time),
  // but for local `npm run build` we do a minimal manual load so
  // VITE_SITE_URL / VITE_API_URL still work without adding a dotenv
  // dependency just for this script.
  for (const file of ['.env.local', '.env']) {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) continue;
    for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (!match) continue;
      const [, key, rawValue = ''] = match;
      if (process.env[key] === undefined) {
        process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
      }
    }
  }
}

async function main() {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  const [projectSlugs, blogSlugs] = await Promise.all([fetchProjectSlugs(), fetchBlogSlugs()]);

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), buildSitemap(projectSlugs, blogSlugs));
  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), buildRobots());

  console.log(
    `[generate-seo] Wrote sitemap.xml (${STATIC_ROUTES.length} static + ${projectSlugs.length} project + ${blogSlugs.length} blog URLs) and robots.txt for ${SITE_URL}`
  );
}

main().catch((err) => {
  console.error('[generate-seo] Unexpected failure, writing static-only fallback:', err);
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), buildSitemap([], []));
  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), buildRobots());
});
