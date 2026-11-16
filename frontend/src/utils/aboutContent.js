// Pure helpers that turn CMS data into what the About and Resume pages show.
// Nothing here invents content: every helper returns an empty result when the
// CMS has nothing, and the component decides how to present that.

/**
 * Dates come from MySQL DATE columns, which the API serialises as UTC midnight.
 * Format in UTC so a visitor in a timezone west of UTC does not see the
 * previous month.
 */
function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "Mar 2024", or '' when the date is missing or invalid. */
export function monthYear(value) {
  const d = parseDate(value);
  return d ? d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', timeZone: 'UTC' }) : '';
}

/** "2024", or '' when the date is missing or invalid. */
export function yearOf(value) {
  const d = parseDate(value);
  return d ? String(d.getUTCFullYear()) : '';
}

/** "Mar 2022 – Present" / "Mar 2022 – Jun 2024". A missing start date shows only the end. */
export function dateRange(item) {
  const start = monthYear(item?.start_date);
  const end = item?.is_current ? 'Present' : monthYear(item?.end_date) || (start ? 'Present' : '');
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

/**
 * "2 yrs 4 mos" from the real start and end dates (today for a current role).
 * Returns '' when there is no start date or the span is under a month.
 * `now` is injectable for tests.
 */
export function durationLabel(item, now = new Date()) {
  const start = parseDate(item?.start_date);
  if (!start) return '';
  const end = item?.is_current ? now : parseDate(item?.end_date) || now;
  const months = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth());
  if (months < 1) return '';
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y ? `${y} ${y === 1 ? 'yr' : 'yrs'}` : '', m ? `${m} ${m === 1 ? 'mo' : 'mos'}` : ''].filter(Boolean).join(' ');
}

/** Blank-line separated paragraphs; single line breaks stay inside a paragraph. */
export function splitParagraphs(text) {
  if (typeof text !== 'string') return [];
  return text.split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean);
}

/** Up to two capital letters from a name, for the portrait placeholder. */
export function initials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Bento column spans for `n` tiles on a 4-column grid, chosen so every row
 * adds up to 4 and no row has a hole:
 *   rows of three alternate [2,1,1] and [1,1,2]; the remainder is [4] (one
 *   tile) or [2,2] (two tiles). Both 3-tile rows keep their 1s together, so
 *   the same spans also fill a 2-column grid.
 */
export function bentoSpans(n) {
  const count = Math.max(0, Math.floor(n) || 0);
  const spans = [];
  let remaining = count;
  let flip = false;
  while (remaining >= 3 && !(remaining === 4)) {
    spans.push(...(flip ? [1, 1, 2] : [2, 1, 1]));
    flip = !flip;
    remaining -= 3;
  }
  if (remaining === 4) spans.push(1, 1, 1, 1);
  else if (remaining === 2) spans.push(2, 2);
  else if (remaining === 1) spans.push(4);
  return spans;
}

/** Skills API returns { [category]: Skill[] }. Largest category first (stable), empty ones dropped. */
export function skillCategories(grouped) {
  if (!grouped || typeof grouped !== 'object') return [];
  return Object.entries(grouped)
    .map(([name, list], index) => ({
      name,
      index,
      skills: (Array.isArray(list) ? list : []).filter((s) => s && String(s.name || '').trim()),
    }))
    .filter((c) => c.name && c.skills.length)
    .sort((a, b) => b.skills.length - a.skills.length || a.index - b.index)
    .map(({ name, skills }) => ({ name, skills }));
}

/** A usable proficiency is a whole-ish number from 1 to 100; anything else means "not set". */
export function skillLevel(skill) {
  const n = Number(skill?.proficiency);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(100, Math.round(n));
}

/**
 * Bars are shown only when they say something. Every new skill in the admin
 * starts at 80, so a set where all levels are identical (or missing) is
 * almost certainly untouched defaults: showing 12 equal bars would look like
 * a claim the owner never made. With two or more different levels the owner
 * has clearly rated them, and the bars appear.
 */
export function hasMeaningfulLevels(categories) {
  const seen = new Set();
  categories.forEach((c) => c.skills.forEach((s) => {
    const lv = skillLevel(s);
    if (lv !== null) seen.add(lv);
  }));
  return seen.size >= 2;
}

/** Every skill name, unique, in category order (for structured data). */
export function skillNames(categories, limit = 20) {
  const seen = new Set();
  const out = [];
  categories.forEach((c) => c.skills.forEach((s) => {
    const name = String(s.name).trim();
    if (!seen.has(name.toLowerCase())) {
      seen.add(name.toLowerCase());
      out.push(name);
    }
  }));
  return out.slice(0, limit);
}

/** { skills: "01", experience: "02" } for the sections that exist, in order. */
export function sectionNumbers(keys) {
  const out = {};
  keys.filter(Boolean).forEach((k, i) => { out[k] = String(i + 1).padStart(2, '0'); });
  return out;
}

/** "Issued 2024" or "Issued 2022 · Expires 2025"; '' with no dates. */
export function credentialDates(cert) {
  const issued = yearOf(cert?.issue_date);
  const expires = yearOf(cert?.expiry_date);
  return [issued && `Issued ${issued}`, expires && `Expires ${expires}`].filter(Boolean).join(' · ');
}

/** "github.com/name" from a full URL, for plain-text contact lines on the resume. */
export function displayUrl(url) {
  return String(url || '').trim().replace(/^[a-z]+:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '');
}

/** The gallery images of an achievement as lightbox items; icon first when it is not already in the gallery. */
export function achievementImages(achievement) {
  const gallery = Array.isArray(achievement?.gallery) ? achievement.gallery.filter(Boolean) : [];
  const icon = achievement?.icon_url || '';
  const urls = icon && !gallery.includes(icon) ? [icon, ...gallery] : gallery;
  return urls.map((url, i) => ({
    id: `${achievement?.id ?? 'a'}-${i}`,
    media_type: 'image',
    url,
    caption: achievement?.title || '',
  }));
}
