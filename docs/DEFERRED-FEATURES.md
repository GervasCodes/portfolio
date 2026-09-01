# Deferred: SSR/SSG and True Responsive Images

Both of these came up in the portfolio audit as real gaps, but both need an
architecture change beyond a markup/config tweak, so they're intentionally
**not** implemented in this pass — documented here as follow-up work instead
of being half-done.

## 1. Server-side rendering / prerendering

**The gap:** the frontend is a pure client-rendered Vite SPA. Initial HTML
is an empty `<div id="root">`; every page's real content, title, meta tags,
and JSON-LD are injected by React + `react-helmet-async` after JS runs.
Google's crawler executes JS and handles this fine, but some social-card
crawlers (older Facebook/Twitter bots, some link-preview services) don't —
they only ever see the static fallback tags in `index.html`.

**Why it's not a quick fix:** this is a rendering-model change, not a
config flag. The realistic paths are:
- Migrate to a framework with SSR/SSG built in (Next.js, Astro, Remix) —
  effectively a rewrite of the routing/data-fetching layer.
- Add prerendering to the existing Vite setup (`vite-plugin-ssr`,
  `vite-prerender-plugin`, or a custom Puppeteer-based prerender step in
  the build) — smaller than a framework migration, but still a real build
  pipeline change that needs testing against every route, including
  dynamic ones (`/blog/:slug`, `/projects/:slug`).

**Recommendation:** treat this as its own project, not a task inside a
larger phase. Scope it separately once there's bandwidth, and pick
prerendering (lower migration cost) unless there's an independent reason
to move off Vite entirely.

## 2. True responsive images (`srcset`/`<picture>`)

**The gap:** project/blog/profile images are served as a single file per
upload — there's no smaller variant for a phone screen to download instead
of the same asset a desktop gets.

**Why it's not a quick fix:** I checked the actual upload pipeline
(`backend/src/services/storage.service.js`) before deciding this — the
`sharp`-based `optimizeImageBuffer` step resizes to a single capped
dimension (2000px longest edge) and stores exactly one file per upload.
There's no second or third size to point a `srcset` at, and Supabase's
public storage URLs don't support on-the-fly resizing on this plan.
Writing a `srcset` with the same URL repeated at different width
descriptors doesn't save anyone any bandwidth — it would just be markup
that looks like a fix without being one.

**What actually implementing this requires:**
1. Backend: generate 2–3 sized variants on upload (e.g. 400w/800w/1600w)
   alongside the existing full-size image, and store all their URLs.
2. A schema change whereever an image URL is currently stored as a single
   column (project cover/gallery, blog cover, avatar) to hold the set of
   variant URLs instead of one string — plus a migration.
3. Frontend: update every image-rendering component (`ProjectCards`,
   `ProjectGallery`, `Hero`, `About`, `ProfilePage`) to build a real
   `srcset`/`sizes` attribute from those variants.

**Recommendation:** scope this as its own backend-first feature (steps 1–2
above are the real work; step 3 is comparatively mechanical once the data
exists). Worth doing before or alongside a CDN/image-hosting upgrade if
one is ever considered, since that would change how variants are
generated anyway (many image CDNs generate resizes on the fly from a URL
parameter, which would remove the need for step 1 entirely).
