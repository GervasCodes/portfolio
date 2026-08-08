# Roadmap

## Done
- [x] Backend: models, services, controllers, routes for all resources
- [x] MySQL schema + migration/seed scripts
- [x] Supabase Storage integration for media uploads
- [x] JWT admin authentication
- [x] Public site: home, about, skills, experience, projects (+detail), blog (+detail), resume, contact
- [x] Admin dashboard: login, profile, projects CRUD, blog CRUD (with Markdown write/preview),
      certificates CRUD, achievements CRUD, settings/messages/analytics
- [x] Certificates & achievements surfaced on the public About page
- [x] Pagination on the public Projects and Blog listing pages
- [x] Markdown rendering for blog posts (`react-markdown` + `remark-gfm`)
- [x] Backend unit tests (`node --test`) for validation, error handling, and service hooks
- [x] **Backend integration tests against a real MySQL 8 database** (`tests/integration.test.js`,
      gated behind `INTEGRATION_TEST_DB=1`) — covers project/blog creation, slug lookup,
      pagination, and view-count tracking
- [x] GitHub Actions CI (`.github/workflows/ci.yml`) — backend lint + `node --test` and
      frontend lint + production build, on every push/PR to `main`
- [x] Automated database backups (`.github/workflows/backup.yml`, daily cron) — dumps
      Aiven MySQL to a gzipped `.sql.gz` file and uploads it to Supabase Storage
      (`backend/scripts/backup.js`), pruning old backups beyond a retention count
- [x] Image optimization on upload — JPEG/PNG/WebP are resized (2000px max edge) and
      recompressed via `sharp` before being stored in Supabase (`storage.service.js`);
      SVGs and GIFs are left untouched
- [x] Verified end-to-end against a real MySQL instance: migrations, seeding, the full
      Express server booting, and every route (auth, profile, projects, blog, skills,
      settings, analytics, contact, 404 handling) manually exercised with curl
- [x] Verified: `npm install` + `npm test` (backend) and `npm install` + `npm run build`
      (frontend) both succeed locally with 0 npm audit vulnerabilities

## Bugs found and fixed during verification
- `Validator.isEmail` validated the raw string before trimming, rejecting valid emails
  with leading/trailing whitespace
- The Supabase client crashed the entire server at startup if `SUPABASE_URL`/
  `SUPABASE_SERVICE_KEY` weren't set yet (common on first run) — now degrades to a
  clear runtime error on actual upload attempts instead
- Every paginated query (`LIMIT ? OFFSET ?`) failed with "Incorrect arguments to
  mysqld_stmt_execute" because mysql2's server-side prepared statements (`execute()`)
  don't support placeholders in LIMIT/OFFSET — switched the DB wrapper to `query()`

## Not yet implemented
- [ ] Actual deployment (see `docs/DEPLOYMENT.md` for the manual steps — needs your
      own Aiven MySQL, Supabase, and SMTP credentials)
- [ ] Next.js major-version bump to clear a transitive `postcss` advisory bundled
      inside Next 14's own dependencies (fix requires Next 16, a breaking change)
