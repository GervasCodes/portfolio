# Redesign v2: summary, status and how to check it

The public site was redesigned in seven phases (foundations, shell, home, work, about/resume, contact/writing/search/newsletter, polish/QA). Rules and tokens live in `03-design-system.md`; per-phase notes are in `docs/rebuild/changes/` and the section appended to each page's doc (`06`, `08`, `09`). Backend, routes, database, auth and admin behaviour were not changed.

## Performance budget: status

Measured with Lighthouse 12 mobile preset (simulated Slow 4G, 4x CPU slowdown) on a **single-vCPU sandbox**, production build served with gzip from localhost, **mock API with realistic JPEG covers**. 2-3 runs per page; results vary a lot between runs on this machine, so ranges are given.

| Budget | Target | Result | Status |
|---|---|---|---|
| First-load JS, Home (gzip) | < 150 KB | 139.9 KB (entry 36.2 + react 52.4 + motion 39.5 + Home chunk and shared 11.8); Markdown vendor chunk is not loaded on Home | Met (10 KB headroom) |
| CLS | < 0.05 | 0 on Home and case study, 0 to 0.012 on a post | Met |
| LCP, Home | < 2.0 s | 0.8 s | Met |
| LCP, case study and blog post | < 2.0 s | 4.0 to 4.5 s | **Not met** |
| TBT (informational) | n/a | Home 580 to 1,570 ms, deep pages 550 to 1,520 ms | High in this lab |
| Lighthouse scores | n/a | Performance 59 to 77, Accessibility 100, Best practices 96, SEO 100 | |
| recharts removed | yes | Done (no chart library; bars are CSS) | Met |
| Fonts | self-hosted, <= 3 families | Instrument Serif, Geist, Geist Mono via @fontsource, `font-display: swap` | Met |

**Why deep-page LCP fails, and what would fix it.** The cover image is only known after the entry bundle, the route chunk (plus the Markdown chunk on posts) and the API call have run. The LCP breakdown shows the time is main-thread work ("element render delay"), not the download. Phase 7 added an early request and image preload for `/projects/:slug` and `/blog/:slug` (see below); in the lab it removed about 400 ms of request delay but did not move LCP measurably. The real fix is to ship the HTML with the content already in it (prerendering or server rendering of project and post pages), which is outside the "frontend only, no backend change" rule of this task. Cheaper partial steps if you want them: `LazyMotion` with `domMax` instead of the full framer-motion build (about 10 to 12 KB gzip less in the entry), and a real mid-range phone test to see whether the lab overstates the problem.

**Not measured:** real-device or real-network numbers, your real API (Render free-tier cold starts are not in these numbers), field data.

## Accessibility: status

- axe-core (WCAG 2.0 to 2.2 A/AA plus best practices): 0 violations on Home, About, Work (grid and list), a case study, Resume, Writing, a post, Contact (also with errors showing), Search, newsletter pages and 404, in dark and light, after fixing one heading-order skip on `/projects` in Phase 7.
- Touch targets under 44 px in main content: none on the pages audited (in-sentence links are exempt).
- Not done: manual screen-reader pass, forced-colors visual check, a keyboard-only walk of every page by a person.

## Motion audit

Allowed loops are the only loops: ambient glow (28 s, CSS only, paused while the tab is hidden via `data-tab-hidden`), tools marquee (48 s), loading skeleton pulse and spinner. No literal transition or animation duration over 600 ms outside those. Under `prefers-reduced-motion`: ambient, marquee, word reveal, magnetic buttons and grain are off, every scroll reveal is visible immediately, the timeline line is drawn in full. Verified on 10 pages.

## Images

`ui/ProgressiveImage.jsx` gives every cover explicit width and height, lazy loading (eager and `fetchpriority=high` for `priority`), a fade-in over the card's tint (never on priority images), and a cached-image check. `utils/image.js` adds `srcset`/`sizes` and a 24 px blur-up placeholder, **only** when you build with `VITE_IMAGE_TRANSFORMS=supabase` and the URL is a Supabase public object (Supabase image transformations are a paid-plan feature; the URL mapping is unit-tested but was not tried against a real bucket). Without the flag nothing changes except the fade-in.

## Deep-link early request

`index.html` starts the API request for `/projects/:slug` and `/blog/:slug` before any JS loads and preloads the cover once its URL is known. `services/api.js` (`requestEarly`) reuses that request once; if it is missing, failed, 404, or needs the admin token (drafts), the normal request runs. The fallback API host in `index.html` must match `api.js`.

## Brand assets

New favicon (same mark, now in the accent and amber instead of the old green), `favicon.ico` (16/32/48), 180/192/512 PNG icons and a maskable 512, manifest with the dark theme colours and installable icons, and `og-default.jpg` (1200x630). The old `index.html` pointed at an `og-default.jpg` that did not exist. The new image says only "Portfolio / Full-stack developer" (the repo's own defaults); replace it with one carrying your name and portrait. Per-page social images still come from each project or post cover. The static `og:image` is a relative path, which some crawlers ignore; the per-page tags added by the app are absolute.

## Environment variables

- `VITE_API_URL`: API base (default: the existing Render URL).
- `VITE_IMAGE_TRANSFORMS=supabase`: opt in to resized images (see above).

## Check by hand before launch

1. Lighthouse on your deployed Home, one case study and one post, on a real phone profile; compare with the table.
2. Open each page in Firefox and Safari; print `/resume` from Safari and Firefox (only Chromium was tested).
3. Screen reader: Contact form errors, the lightbox, the command palette, the post contents list.
4. Replace `og-default.jpg`; confirm a shared post link shows its cover (Facebook/LinkedIn debuggers).
5. Check real data: skill proficiency values (bars hide when all equal), long posts with tables/images, projects without covers.
6. Delete the cleanup files: `frontend/src/utils/sampleData.js`, `pages/ProfilePage.jsx`, `pages/ExperiencePage.jsx`, `pages/SkillsPage.jsx`.

## Proposals (need a database change, not made)

`profiles.reply_time` (typical reply time on Contact), `blogs.cover_alt` (cover alt text), services / process steps / testimonials fields (Home), an unsubscribe confirmation step (backend).
