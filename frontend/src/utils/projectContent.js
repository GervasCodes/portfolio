// Pure helpers for the Work pages. Nothing here invents content: every value
// comes from the project record, and a helper returns an empty result when the
// CMS has nothing, so the page decides how to show its empty state.
import { formatYear } from '@/utils/homeContent';

/** A link counts only when it is a real URL (the old seed data used "#"). */
export const isRealUrl = (u) => typeof u === 'string' && u.trim() !== '' && u.trim() !== '#';

export const projectYear = (p) => formatYear(p?.created_at);

const clean = (s) => String(s || '').trim();
const key = (s) => clean(s).toLowerCase();

/** Categories in use, most used first: [{ name, count }]. */
export function listCategories(projects = []) {
  const map = new Map();
  projects.forEach((p) => {
    const name = clean(p.category);
    if (!name) return;
    const k = key(name);
    map.set(k, { name: map.get(k)?.name || name, count: (map.get(k)?.count || 0) + 1 });
  });
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Technologies in use, most used first: [{ name, count }]. */
export function listTech(projects = []) {
  const map = new Map();
  projects.forEach((p) => {
    const seenHere = new Set();
    (Array.isArray(p.tech_stack) ? p.tech_stack : []).forEach((t) => {
      const name = clean(t);
      const k = key(name);
      if (!name || seenHere.has(k)) return;
      seenHere.add(k);
      map.set(k, { name: map.get(k)?.name || name, count: (map.get(k)?.count || 0) + 1 });
    });
  });
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Text search + category + technology, all combined with AND. */
export function filterProjects(projects = [], { q = '', category = '', tech = '' } = {}) {
  const needle = key(q);
  return projects.filter((p) => {
    if (category && key(p.category) !== key(category)) return false;
    if (tech && !(Array.isArray(p.tech_stack) ? p.tech_stack : []).some((t) => key(t) === key(tech))) return false;
    if (!needle) return true;
    const hay = [p.title, p.summary, p.category, ...(Array.isArray(p.tech_stack) ? p.tech_stack : [])]
      .map(key)
      .join(' \n ');
    return hay.includes(needle);
  });
}

/** Previous / next project in the published order. Wraps around; null when there is nothing to link to. */
export function neighbours(projects = [], slug) {
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1 || projects.length < 2) return { prev: null, next: null };
  return {
    prev: projects[(i - 1 + projects.length) % projects.length],
    next: projects[(i + 1) % projects.length],
  };
}

/**
 * Screens for a project, in order, as { id, media_type, url, caption }.
 * Uses the gallery rows (`media`), then the legacy `gallery` URL list, then the
 * cover image, so a project with only a cover still shows it as its screenshot.
 */
export function projectScreens(project) {
  if (!project) return [];
  const rows = Array.isArray(project.media) ? project.media.filter((m) => m?.url) : [];
  if (rows.length) {
    return rows.map((m, i) => ({
      id: m.id ?? i,
      media_type: m.media_type === 'video' ? 'video' : 'image',
      url: m.url,
      caption: m.caption || '',
    }));
  }
  const legacy = Array.isArray(project.gallery) ? project.gallery.filter(Boolean) : [];
  if (legacy.length) {
    return legacy.map((url, i) => ({ id: `g${i}`, media_type: 'image', url, caption: '' }));
  }
  if (project.cover_image_url) {
    return [{ id: 'cover', media_type: 'image', url: project.cover_image_url, caption: '' }];
  }
  return [];
}
