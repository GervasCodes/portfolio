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

---

## Phase 5 (redesign v2): Resume

`/resume` is a single column with no cards or motion: header (name, title, email, phone, location, website, GitHub, LinkedIn from the profile), Profile (first bio paragraph), Experience, Education, Skills (plain comma-separated text, no bars), Certificates. On screen it has Download PDF (if `resume_url`) and Print buttons.

**Print** (`index.css`, "Print"): `tokens.css` swaps in the light palette whatever theme is on screen, so the printout is dark ink on white in both themes. The site header, footer, nav and the resume's buttons are hidden; the resume's own `<header>` is re-shown explicitly (a plain `header { display: none }` would hide the name). `@page` is A4 with 14/16 mm margins. Entries use `break-inside: avoid`; headings use `break-after: avoid`. Two-column rows use `print:` variants because an A4 page is narrower than the `md` breakpoint.

Checked in Chromium (print media, `prefer_css_page_size`): white background and `rgb(20 19 15)` text in both themes, chrome hidden, a full fixture prints on 2 A4 pages. Not checked: Firefox and Safari print engines.

---

## Phase 6 (redesign v2): Writing, Search, Newsletter

**Writing index** (`/blog`): the latest post is a wide feature card on page 1; the rest are a card grid (covers, or generated art from the slug when there is none; date and reading time; tags). Tag filter (`?tag=`) shows a "Clear filter" chip. Retry on error, designed empty states, newsletter signup on page 1.

**Post page** (`/blog/:slug`): header with date, computed reading time, title and excerpt as the lede; cover image; body at a 68ch measure. Desktop shows a sticky "On this page" rail (h2/h3, current section highlighted with an IntersectionObserver); small screens get the same list in a collapsible panel. The list is read from the rendered article, so it cannot disagree with it. Footer: tags (link to the filtered index), share (copy link, native share where available, X, LinkedIn, WhatsApp as plain links, no third-party scripts), reactions (same API, 44 px targets), related posts (same first tag, else latest), newsletter signup. Reading progress is the site-wide scroll bar from the shell.

**Markdown** (`ui/Markdown.jsx`, shared with the admin preview and case studies): h2-h4 get unique ids (`why-i-chose-vite`, `why-i-chose-vite-2`), code blocks get a copy button (clipboard API with a textarea fallback, announced via a status region), external links open in a new tab. It is memoised so a reaction click does not rebuild the article.

**Search** (`/search`): a labelled search field with its own clear button, a pressed-state type filter (All / Projects / Writing), a live region announcing the result count, skeletons, a designed idle state, a no-results state, and an error state with retry (the old page ignored errors). View counts are no longer shown. Still `noindex`.

**Newsletter**: signup keeps its three outcomes (new, already subscribed, error) and the same API. The confirm/unsubscribe page announces the result, moves focus to its heading and offers a way back. Note: the unsubscribe link acts as soon as it is opened (existing behaviour); an email scanner that opens links would unsubscribe the address. Changing that needs a confirm button plus a backend change, so it is left alone.

Dates on these pages are formatted in UTC. Helpers are in `utils/blogContent.js`.
