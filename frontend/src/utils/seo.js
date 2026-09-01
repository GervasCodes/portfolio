/**
 * Shared helpers for building SEO metadata (meta description, OG/Twitter
 * tags, canonical URLs, JSON-LD) across pages. Keeping this logic in one
 * place means every page truncates/normalizes text the same way instead
 * of each page component reinventing it slightly differently.
 */

// The canonical public site URL (the Vercel domain the frontend is
// deployed on), NOT the backend API URL. Used to build absolute
// canonical/OG links and the sitemap. Falls back to a placeholder so
// local dev doesn't crash — set VITE_SITE_URL in production.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://example.com').replace(/\/+$/, '');

/** Turns a relative path ("/projects/foo") into an absolute site URL. */
export function absoluteUrl(path = '/') {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Collapses whitespace and clips text to a safe meta-description length
 * (~155-160 chars is the practical limit before Google truncates it).
 */
export function truncate(text, max = 160) {
  if (!text) return '';
  const clean = String(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Strips common Markdown syntax so blog content can be safely reused as
 * a plain-text meta description / JSON-LD description.
 */
export function stripMarkdown(markdown) {
  if (!markdown) return '';
  return String(markdown)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\(([^)]*)\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>`#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Default social-preview image, used whenever a page doesn't have its
 * own cover image (a blog post/project without one, or a profile with
 * no avatar yet). Put the actual file at frontend/public/og-default.jpg
 * — see the image checklist for specs (1200x630, name + title + a
 * strong visual). Until that file exists, this still resolves to a
 * valid absolute URL; it just won't be a real image until uploaded.
 */
export const DEFAULT_OG_IMAGE = '/og-default.jpg';

/** Falls back through a list of candidate image URLs, resolving to absolute. */
export function resolveImage(...candidates) {
  const found = candidates.find((c) => typeof c === 'string' && c.trim());
  return absoluteUrl(found || DEFAULT_OG_IMAGE);
}
