# Phase 8 — About and Contact (done)

**Assumption:** the plan doesn't define Phase 8, so I took it as the About and Contact pages, which is where the earlier phases deferred the Skills/Experience merge.

## Changes
- **About (`/about`)** is now the single page for profile, Experience, Education, Skills and Certificates/Achievements, in that order. The invented stats ("3+ Projects", "3+ Clients", the default "3+ years"), the fallback bio and all sample data are removed. Role, location and years of experience show only if set in the profile.
- **Timeline** is plain rows (dates | role, organisation, description) instead of cards with a dot rail.
- **Redirects:** `/skills` → `/about#skills`, `/experience` → `/about#experience` (the page scrolls to the section once data loads). `/profile` and `/contacts` already redirect from Phase 4.
- **Contact (`/contact`):** visible labels (the old form used placeholders with screen-reader-only labels), shared Field/Input/Textarea components, no icons or card around the form, no sample email.
- **Deleted:** `SkillsPage.jsx`, `ExperiencePage.jsx`, `ProfilePage.jsx`.
- **`public/sitemap.xml`:** removed /skills and /experience, renamed /contacts to /contact.

## Not done
- Sitemap entries still use `https://example.com`; set your real domain before launch.
- Blog and Resume pages were not touched.

## Verification
lint 0 errors (same 5 old warnings) · build passes · `check:design` passes. Not viewed in a browser, and the hash scroll has not been tested against live data.
