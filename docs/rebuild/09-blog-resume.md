# Blog and Resume pages (done)

## Changes
- **`/blog`:** plain list (date, title, excerpt, tags) instead of a card grid with cover images, view counts and a "Most viewed" pill row. Page title "Writing", 10 posts per page, tag filter heading, real loading/error/empty states. Newsletter signup kept at the bottom of page 1.
- **`/blog/:slug`:** no sample-post fallback; unknown slug shows the 404, loading shows a skeleton. View count and calendar icon removed, tags use the shared Tag, back link reads "All posts". Reactions, video embed and related link are kept.
- **`/resume`:** single column, Experience / Education / Skills as plain rows (same look as About), no sample data, no placeholder name. Print styling hook (`resume-print-area`) and "Download PDF" button kept.
- **Timeline** gained a `bare` option so the resume can use it without the page-wide section wrapper.
- **Deleted `utils/sampleData.js`:** nothing imports it any more.

## Not done
- Post view counts are still recorded by the backend; they are just not shown publicly.
- The "most viewed" API call (`getMostViewedPosts`) is now unused in the UI.
- The newsletter form and reaction buttons were not restyled beyond small radius/border changes.

## Verification
lint 0 errors (same 5 old warnings) · build passes · `check:design` passes. Not viewed in a browser.
