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
