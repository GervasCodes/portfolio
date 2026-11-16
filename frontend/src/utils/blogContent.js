// Pure helpers for Contact, Writing, Search and Newsletter. Nothing here
// invents content: each returns an empty result when the CMS has nothing.

/** "15 November 2026" in UTC (see aboutContent.js for why UTC), '' when missing. */
export function formatLongDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

/** Whole minutes to read, from the post's own text (about 200 words a minute). 0 when empty. */
export function readingMinutes(markdown) {
  const text = String(markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#>*_`~\-|[\]()]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return words ? Math.max(1, Math.round(words / 200)) : 0;
}

/** URL-safe heading id: "Why I chose Vite!" -> "why-i-chose-vite". */
export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Returns a function that hands out unique ids: "setup", "setup-2", ... */
export function uniqueSlugger() {
  const seen = new Map();
  return (text) => {
    const base = slugify(text) || 'section';
    const n = (seen.get(base) || 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };
}

/** Digits only, for wa.me links. Returns '' unless it looks like a real international number. */
export function whatsappDigits(number) {
  const digits = String(number || '').replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15 ? digits : '';
}

/** Share targets for a post. Plain links: no third-party scripts are loaded. */
export function shareLinks(url, title) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  return [
    { id: 'x', label: 'X', href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { id: 'linkedin', label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
  ];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Same limits as the backend (name 1-100, message 5-5000, subject <= 200). Returns { field: message }. */
export function validateContact(form) {
  const errors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const message = form.message.trim();
  if (!name) errors.name = 'Please tell me your name.';
  else if (name.length > 100) errors.name = 'Please keep your name under 100 characters.';
  if (!email) errors.email = 'Please add your email so I can reply.';
  else if (!EMAIL_RE.test(email)) errors.email = 'That email does not look right. Check for typos.';
  if (form.subject.trim().length > 200) errors.subject = 'Please keep the subject under 200 characters.';
  if (!message) errors.message = 'Please write a short message.';
  else if (message.length < 5) errors.message = 'A little more detail, please (at least 5 characters).';
  else if (message.length > 5000) errors.message = 'That is over the 5,000 character limit. Please shorten it.';
  return errors;
}

/** "12 results" / "1 result" for the search live region. */
export function resultsLabel(count, query) {
  return `${count} ${count === 1 ? 'result' : 'results'} for “${query}”`;
}

/** Tags of a post as a clean array of strings. */
export function postTags(post) {
  return Array.isArray(post?.tags) ? post.tags.map((t) => String(t).trim()).filter(Boolean) : [];
}
