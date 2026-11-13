# Phase 0 — Baseline (taken on branch `rebuild/main`, tag `v1-legacy`)

No application behaviour or visuals were changed in this phase.

## Snapshot
- The zip's working tree had **60 uncommitted changes** on top of the last commit (`7679017 updates`), including `.github/` deleted locally. The snapshot commit `57c60fe` captures that working tree and **restores `.github/`** from git history. Tag `v1-legacy` points at it.
- Nothing was pushed anywhere. Original zip untouched.

## Run locally
```
cd backend  && cp .env.example .env && npm ci && npm run dev     # API on :5000
cd frontend && cp .env.example .env && npm ci && npm run dev     # Vite dev server
cd database && npm ci && node scripts/... (see database/README.md; backend/scripts/migrate.js applies migrations)
```
Required env: see `backend/.env.example` (DB, JWT, Supabase, BREVO_*) and `frontend/.env.example` (API URL, VITE_SITE_URL).
Not verified here: a live database/Supabase/Brevo was not available, so only lint, unit tests and builds were run.

## Quality gates (measured)
| Check | Result |
|---|---|
| Frontend `npm run lint` | 0 errors, 5 warnings |
| Frontend `npm run build` | passes (10s) |
| Backend `npm run lint` | 0 errors, 5 warnings |
| Backend `npm test` | 26 tests: 25 pass, 0 fail, 1 skipped (integration test gated by `INTEGRATION_TEST_DB=1`) |
| Lighthouse, screenshots at 375/768/1280 | **Not captured** — no browser available in this environment. Run `docs/rebuild/scripts/capture-baseline.mjs` locally (untested script) and drop results into `docs/rebuild/screenshots/` |

## Bundle sizes (production build, gzip)
| Chunk | Size |
|---|---|
| vendor-charts (recharts) | 411 KB (110 KB gz) |
| vendor-react | 163 KB (53 KB gz) |
| vendor-markdown | 157 KB (47 KB gz) |
| vendor-motion (framer-motion) | 116 KB (38 KB gz) |
| index (app shell) | 91 KB (33 KB gz) |
| HomePage | 9.6 KB (3.2 KB gz) |

## Frontend routes
Public: `/`, `/about`, `/skills`, `/experience`, `/projects`, `/projects/:slug`, `/blog`, `/blog/:slug`, `/resume`, `/profile`, `/contacts`, `/search`, `/newsletter/confirm`, `/newsletter/unsubscribe`, `*` (404).
Admin: `/admin/login`, `/admin/profile`, `/admin/skills`, `/admin/experience`, `/admin/projects`, `/admin/blog`, `/admin/certificates`, `/admin/achievements`, `/admin/subscribers`, `/admin/setting` (singular).
Overlap to resolve in Phase 1: `/about` vs `/profile` vs `/resume`; Home repeats About, Skills, Contact.

## API (already mounted at `/api` and `/api/v1`)
Auth (login, 2FA verify, refresh, logout, me, 2FA setup/enable/disable), profile, projects (+featured, by id, media CRUD and reorder), blog (+most-viewed, admin list, reactions), skills, experience, certificates, achievements, settings, analytics (+pageview), contact (list/read/delete), newsletter (subscribe/confirm/unsubscribe/subscribers/stats), media, search. State-changing admin routes use `requireAuth` + CSRF (`verifyCsrf`), except newsletter subscriber delete (`DELETE /subscribers/:id`) which has no `verifyCsrf` — noted for Phase 9.

## Database (17 tables, 14 migrations)
profiles, projects, project_media, skills, experiences, blogs, blog_reactions, blog_post_views, certificates, achievements, contacts, media, settings, analytics_visits, admins, refresh_tokens, newsletter_subscribers.

## "Template look" inventory (occurrences in `frontend/src`)
`glass` 60 · `glass-hover` 36 · `text-gradient` 16 · `card-premium` 14 · `shadow-glow` 9 · `backdrop-blur` 3 · `animate-float*` 3 · `bg-noise` 2 · `animate-shine` 1.
Hero: pulsing availability pill, shine sweep, 3 blurred blobs, bouncing scroll cue, gradient avatar ring, Pexels photo at 8% opacity.

## Hardcoded content / placeholders
- Stock images: `Hero.jsx` (Pexels), `About.jsx` (Pexels).
- Fake-looking stats: `About.jsx` — "3+ Projects Shipped", "3+ Happy Clients".
- `Footer.jsx`: GitHub and LinkedIn fallbacks are generic placeholders (TODOs); sample email in `sampleData.js` uses example.com.
- `utils/seo.js`: `SITE_URL` falls back to `https://example.com`.
- **Sample data is the initial state** on About, Profile, Contacts, Skills, Resume, Projects and ProjectDetail (`useState(sampleX)`), so visitors see placeholder content before the API answers. Home starts empty but falls back to sample data when the API returns nothing. ProjectDetail shows `sampleProjects[0]` for any unknown slug.

## Ranked bug / risk list
1. Unknown project slug renders a sample project instead of a 404 (`ProjectDetailPage.jsx`).
2. Sample data shown as initial state on 7 pages, plus as a Home fallback (content flash and wrong data if the API is slow or down).
3. `VITE_SITE_URL` fallback `https://example.com` leaks into canonical/OG tags if the env var is unset.
4. Footer placeholder social links.
5. `DELETE /newsletter/subscribers/:id` lacks `verifyCsrf` (inconsistent with every other admin mutation).
6. `/admin/setting` naming inconsistent.
7. Backend naming: `src/utills/`, `responce.js`.
8. Frontend and API on different subdomains forces `SameSite=None` cookies.
9. Lint warnings (10 total) — unused vars and stale eslint-disable directives.
10. Open Dependabot branches for majors (React 19, Express 5, ESLint 10, react-markdown 10, recharts 3, helmet 8, sharp 0.35, dotenv 17, morgan, GitHub Actions v7).

## Corrections to my earlier review (verified in this phase)
- `/api/v1` and CSRF protection **already exist**, so Phase 2 does not need to add them; response shape is `{ success, statusCode, message, data?, meta? }`.
- CI workflows **exist in git** (they were only missing from the zip). `ci.yml` intentionally runs lint + build only and **does not run tests**, although `docs/ROADMAP.md` says it does — to fix in Phase 11.
- recharts is also used by the **admin settings traffic chart**, so removing it in Phase 7 means replacing that chart too.
