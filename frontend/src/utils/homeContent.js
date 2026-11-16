// Pure helpers that turn CMS data into what the Home sections show.
// Nothing here invents content: a helper returns an empty result when the
// CMS has nothing, and the section decides how to show its empty state.

/** Month + year, e.g. "Mar 2024". Empty string when the date is missing/invalid. */
export function formatMonthYear(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short' });
}

/** Year only, for project cards. */
export function formatYear(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : String(d.getFullYear());
}

/** Skills API returns { [category]: Skill[] }. Flatten to one list of names (unique, in order). */
export function flattenSkills(grouped) {
  if (!grouped || typeof grouped !== 'object') return [];
  const seen = new Set();
  const out = [];
  Object.values(grouped).forEach((list) => {
    (Array.isArray(list) ? list : []).forEach((s) => {
      const name = s?.name?.trim();
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        out.push(name);
      }
    });
  });
  return out;
}

/** The `n` categories with the most skills: [{ name, skills: string[] }]. */
export function topCategories(grouped, n = 3) {
  if (!grouped || typeof grouped !== 'object') return [];
  return Object.entries(grouped)
    .map(([name, list]) => ({
      name,
      skills: (Array.isArray(list) ? list : []).map((s) => s?.name?.trim()).filter(Boolean),
    }))
    .filter((c) => c.name && c.skills.length)
    .sort((a, b) => b.skills.length - a.skills.length)
    .slice(0, n);
}

/**
 * "How I work" steps live in the existing key/value settings table, so no
 * schema change is needed:
 *   process_step_1_title, process_step_1_text ... process_step_4_title, process_step_4_text
 * A step counts only when it has a title.
 */
export function getProcessSteps(settings) {
  if (!settings) return [];
  const steps = [];
  for (let i = 1; i <= 4; i += 1) {
    const title = String(settings[`process_step_${i}_title`] || '').trim();
    const text = String(settings[`process_step_${i}_text`] || '').trim();
    if (title) steps.push({ title, text });
  }
  return steps;
}

/** True when an admin session token is present (used to show owner-only setup hints). */
export function hasAdminSession() {
  try {
    return Boolean(window.localStorage.getItem('portfolio_token'));
  } catch {
    return false;
  }
}

/** Work entries, current role first, then newest start date. */
export function latestWork(items, n = 3) {
  const list = Array.isArray(items) ? [...items] : [];
  list.sort((a, b) => {
    if (Boolean(b.is_current) !== Boolean(a.is_current)) return b.is_current ? 1 : -1;
    return new Date(b.start_date || 0) - new Date(a.start_date || 0);
  });
  return list.slice(0, n);
}

/** Certificates + achievements merged into one strip of { key, title, meta, image, href }. */
export function recognitionItems(certificates, achievements, n = 8) {
  const certs = (Array.isArray(certificates) ? certificates : []).map((c) => ({
    key: `c-${c.id ?? c.title}`,
    kind: 'Certificate',
    title: c.title,
    meta: [c.issuer, formatYear(c.issue_date)].filter(Boolean).join(' · '),
    image: c.badge_image_url || '',
    href: c.credential_url || '',
    time: new Date(c.issue_date || 0).getTime() || 0,
  }));
  const wins = (Array.isArray(achievements) ? achievements : []).map((a) => ({
    key: `a-${a.id ?? a.title}`,
    kind: 'Achievement',
    title: a.title,
    meta: [formatYear(a.date), a.description].filter(Boolean).join(' · '),
    image: a.icon_url || (Array.isArray(a.gallery) && a.gallery[0]) || '',
    href: '',
    time: new Date(a.date || 0).getTime() || 0,
  }));
  return [...certs, ...wins].filter((i) => i.title).sort((a, b) => b.time - a.time).slice(0, n);
}
