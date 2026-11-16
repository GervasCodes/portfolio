# Phase 7 - Polish, performance, QA

Full write-up: docs/rebuild/12-redesign-v2.md. Earlier phases: docs/rebuild/changes/phase-5.md, phase-6.md.

## Files
Added
- frontend/src/utils/image.js - optional srcset / blur-up URLs (Supabase transforms, off by default)
- frontend/src/components/ui/ProgressiveImage.jsx - sized, lazy/priority image with fade-in
- frontend/public/icon-192.png, icon-512.png, icon-512-maskable.png, og-default.jpg (was referenced but missing)
- docs/rebuild/12-redesign-v2.md, docs/rebuild/changes/phase-5.md, phase-6.md

Changed
- frontend/index.html - early request + cover preload for deep links; clean fallback description; og:image size tags
- frontend/src/services/api.js - requestEarly() reuses that request for getProjectBySlug / getPostBySlug
- frontend/src/components/ui (ProgressiveImage used by): projects/ProjectCover.jsx, projects/DeviceFrame.jsx (srcset), sections/SelectedWork.jsx, sections/LatestWriting.jsx, blog/PostCard.jsx, pages/BlogDetailPage.jsx
- frontend/src/components/projects/ProjectCards.jsx, ProjectList.jsx, pages/ProjectsPage.jsx - heading level prop (fixes the h1 -> h3 skip axe found on /projects)
- frontend/src/index.css - .img-fade
- frontend/public/favicon.svg, favicon.ico, apple-touch-icon.png, manifest.json - new palette, installable icons, dark theme colours

## Verified
- eslint clean, check:design passed, builds OK; unit tests for helpers (about, image) pass.
- Bundle: Home first-load JS 139.9 KB gzip (budget 150).
- Lighthouse mobile (mock API, 1 vCPU, 2-3 runs): Home perf 74-77, LCP 0.8 s, CLS 0; case study perf 62-72, LCP 4.0-4.5 s; post perf 59-70, LCP 4.1-4.3 s; Accessibility 100, Best practices 96, SEO 100 everywhere. Run-to-run variance is large (Home TBT 580-1,570 ms; one 13 s Speed Index outlier).
- Sweep: 10 public pages x 5 widths x 2 themes: no horizontal overflow, no broken images, no app console errors; axe clean at 1440 in both themes (after the /projects heading fix; re-checked on grid, list and Home).
- Motion and reduced-motion audit on 10 pages (see doc 12).
- Brand assets rendered and viewed.

## NOT verified / not met
- LCP < 2.0 s is NOT met on case studies and posts in the lab (4.0-4.5 s). The early request did not measurably help. Real fix = prerender those pages (outside this task's scope). See doc 12.
- Lighthouse on your real deployment, a real phone, field data.
- Srcset/blur-up against a real Supabase bucket (URL mapping unit-tested only); fade-in not inspected by eye.
- Firefox / Safari (including printing /resume), screen reader, forced-colors.
- Home, Work and case-study pages were swept for overflow, errors and axe in this phase but not re-inspected visually (their visuals belong to Phases 3-4).
- Static og:image is a relative path; some crawlers ignore it.

## Cleanup (still in your upload; safe to delete)
frontend/src/utils/sampleData.js, frontend/src/pages/ProfilePage.jsx, frontend/src/pages/ExperiencePage.jsx, frontend/src/pages/SkillsPage.jsx
