# Phase 4 — Navigation, footer, routes and 404 (done)

**Assumption:** you said "go straight to phase 4", so I did not wait for the Phase 1 content answers. Nothing here needs
your real copy; it follows the sitemap in `01-ia-and-content.md`.

## What changed
- **Navbar:** flat solid header with a bottom border (no floating panel, no scroll-progress bar, no pill animation).
  Brand text fixed ("Gerry's Portfolio" — the missing space is gone). Five items: Work · About · Writing · Resume · Contact,
  plus a search icon linking to `/search`. Active page is underlined and marked `aria-current`. Mobile menu is a plain
  list, closes on navigation and on Escape.
- **Writing is hidden** from the nav and footer until the API reports at least 3 published posts (`usePostCount`).
  `/blog` still works by URL.
- **Footer:** flat, brand + site links + external links. Placeholder GitHub/LinkedIn URLs and the hardcoded fallback
  email/phone/Instagram are removed; a link shows only if the value exists in Admin → Profile.
- **Routes:** `/contact` is the contact page; `/contacts` and `/profile` redirect (`/contacts` → `/contact`, `/profile` → `/about`).
- **404:** rewritten as plain text with four useful links.
- `--navbar-h` fallback is now 64px.

## Not done on purpose
- `/skills` and `/experience` are **not** redirected yet. About does not have those sections, so redirecting to
  `/about#skills` would land on nothing. Redirect them when About absorbs them (page tuning phases).
- `pages/ProfilePage.jsx` is now unused; keep it until its content is merged into About, then delete.
- Per-page heading weights and scroll-reveal animations are untouched (Phases 5–7).

## Verification
`npm run lint` 0 errors (same 5 old warnings) · `npm run build` passes · `npm run check:design` passes.
Not visually checked in a browser this time, and the API is unreachable from my sandbox, so the 3-post rule is untested live.
