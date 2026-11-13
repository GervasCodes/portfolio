# Security fix and lint cleanup (done)

Covers items 3, 5 and 9 of the ranked list in `00-baseline.md`.

## Changes
- **CSRF gap closed (#5):** `DELETE /newsletter/subscribers/:id` now runs `verifyCsrf` after `requireAuth`, like every other admin mutation. The admin frontend already sends the `X-CSRF-Token` header on all requests, so the admin UI needs no change.
- **Regression test:** `backend/tests/csrf-coverage.test.js` scans every route file and fails if any `post/put/patch/delete` route that uses `requireAuth` lacks `verifyCsrf`. I confirmed it fails on the old route and passes on the fixed one. Other mutation routes without `requireAuth` are public by design (login, refresh, logout, contact, subscribe, confirm, unsubscribe, reactions, pageview).
- **`SITE_URL` (#3):** without `VITE_SITE_URL` it now falls back to the page's own origin instead of `https://example.com`, so canonical and Open Graph tags never carry a placeholder domain. Still set `VITE_SITE_URL` in production.
- **Lint (#9):** the 5 remaining warnings are fixed (stale disable directives, unused `useNavigate`, unused catch variable). One directive was on the wrong effect in `SearchPage.jsx`; it now sits on the effect that intentionally limits its dependencies, with a reason.

## Not done
- #6 (`/admin/setting` naming) and #7 (`src/utills/`, `responce.js` folder and file names): renames touch many imports and deploy paths, so I left them for a separate, reviewed change.
- #8 (frontend and API on different subdomains forcing `SameSite=None` cookies): a hosting decision, not a code fix.
- #10 (Dependabot major upgrades): not attempted; recharts is already removed (Phase 7).
- `public/sitemap.xml` still lists `https://example.com`; replace it with your real domain.

## Verification
Backend: 26 pass, 0 fail, 1 skipped (the integration test needs a real MySQL database and `INTEGRATION_TEST_DB=1`). Frontend: lint 0 errors and 0 warnings, build passes, `check:design` passes.
