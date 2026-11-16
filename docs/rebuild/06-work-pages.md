# Phase 6 — Work pages: project list and case study (done)

**Assumption:** your plan doesn't say what Phase 6 is, so I took it as the Work pages from the IA doc (`/projects`, `/projects/:slug`). Tell me if you meant something else.

## Changes
- **`/projects`:** left-aligned "Selected work" header, plain rows (same component as Home), labelled search field, real loading, error (with retry) and empty states. Page title is now "Work".
- **`/projects/:slug`:** header, one-line summary, "Visit live site" / "View code" (shown only for real URLs), technology tags, gallery, then the case study.
- **Case study order** follows the template: Problem · Decisions and trade-offs · Architecture · Result · What I would change. Same database fields, new labels; empty sections are skipped. Projects without a case study show their description.
- **Unknown slug** now shows the 404 page. Before, it silently showed the first sample project.
- **Sample data removed** from both pages (it held invented projects). New shared `components/projects/ProjectList.jsx`.

## Not done
- "Context", "role and dates" and "Links" from the template need new database fields; not added (no backend change in this phase).
- `ProjectCards.jsx` and `sections/Projects.jsx` are now unused.

## Verification
lint 0 errors (same 5 old warnings) · build passes · `check:design` passes. Not viewed in a browser.

---

# Redesign v2 — Phase 4 (Work)

The Work pages were rebuilt in the v2 language (dark-first, spotlight cards, device frames). Same routes, same API, same SEO tags and structured data.

## Index (`/projects`)
- All published projects are fetched once (`hooks/useAllProjects.js`, shared cache) and filtered on the client: text search, one category, one technology, combined with AND.
- Filters live in the URL: `?q=&category=&tech=&view=list`. Old links with `?page=` still work.
- Grid and list views. Items fade and glide when the filter changes (transform and opacity only); with reduced motion the list simply updates.
- Cards never show a blank cover: a missing image becomes abstract art generated from the title (`PlaceholderArt`, same title = same art).
- Loading shows a skeleton with the same boxes as the cards. Error has a retry. Empty has a designed state. Nothing is invented.

## Case study (`/projects/:slug`)
- Header, full-width device-framed hero screen, then a two-column story: sticky side facts (category, year, stack, links, jump list) and numbered sections. "Result" is set as a raised callout. Only fields that exist are shown.
- Screens are drawn in a CSS laptop frame; portrait images switch to a phone frame inside the same 16:10 box (no layout shift). No screenshot at all = generated art, shown as art, not as a fake device.
- Gallery opens a keyboard-accessible lightbox (dialog, focus trap, Esc, arrow keys, focus returns to the thumbnail, counter announced).
- Next project card at the bottom, previous project as a quiet link.
- A failed request now shows a retry instead of a 404; only a real "not found" answer shows the 404 page.

## Test data
`utils/sampleData.js` and the two unrouted pages that used it (`ProfilePage.jsx`, `ExperiencePage.jsx`) were deleted. No page falls back to invented content any more.
