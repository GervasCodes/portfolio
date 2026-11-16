# Navigation, footer and page shell (redesign v2, Phase 2)

Replaces the old "flat solid header" shell. Frontend only: no route, API, auth or admin behaviour changed.

## What the shell is made of

| Piece | File | Notes |
|---|---|---|
| Floating glass navbar | `components/layout/Navbar.jsx` | Glass allowed here and in the palette only. 64 px bar, shrinks to 48 px after 24 px of scroll. Sliding active indicator (framer-motion `layoutId`). Theme toggle, Search / Cmd+K button, local time (xl screens, hidden while shrunk). |
| Mobile menu | `Navbar.jsx` | Full-screen opaque overlay, links stagger in (60 ms apart), focus moves into it, Tab is trapped between header and overlay, Escape closes and returns focus to the menu button, page scroll is locked, closes on navigation and when the window is widened to `md`. |
| Scroll progress | `components/layout/ScrollProgress.jsx` | 3 px accent bar. Kept under reduced motion (it only mirrors scroll position). |
| Page transitions | `App.jsx` | Enter: 350 ms fade + 12 px rise. Exit: 150 ms fade. `mode="wait"`. Scroll resets in `onExitComplete`. Disabled entirely under `prefers-reduced-motion`. |
| Route housekeeping | `components/layout/ScrollToTop.jsx` | Moves focus to `<main>` after each navigation (not on first load); scrolls to a `#hash` once the target exists. |
| Command palette | `components/layout/CommandPalette.jsx`, `hooks/useCommandPalette.jsx` | Cmd/Ctrl+K or the navbar button. Code-split: downloaded on first open only. |
| Footer | `components/layout/Footer.jsx` | Email CTA (+ copy), site and social links, local time, availability, big gradient wordmark. |
| 404 | `pages/NotFoundPage.jsx` | Giant 404 numeral, search form to `/search?q=`, one card per nav destination. |
| Skip link | `SkipToContent.jsx` | Unchanged, still the first focusable element. |
| Shared | `hooks/useNavLinks.js`, `hooks/useLocalTime.js`, `utils/clipboard.js` | One list of nav links for navbar, menu, footer, palette and 404. |

## Navigation

Work · About · Writing · Resume · Contact. **Writing appears as soon as one post is published** (previously three). `/blog` still works by URL.
The shell is not rendered on `/admin/*` (admin keeps its own layout), and Cmd/Ctrl+K is inactive there.

## Command palette

* Groups: Pages, Projects, Writing, Actions (switch theme, copy email, start a project by email), and "See all results" for a typed query.
* Data: with an empty query, featured projects (4) and latest posts (3). With 2+ characters it calls the existing `GET /api/search` (debounced 250 ms; late responses are ignored).
* Keyboard: Up/Down/Home/End move, Enter runs, Escape closes. ARIA combobox + listbox, `aria-activedescendant`, focus returns to the element that opened it.
* Email actions only exist when Admin → Profile has an email.

## Content rules (honest content)

* Brand name = Admin → Profile `full_name`, else Settings `site_title`, else "Portfolio". The old hard-coded "Gerry's Portfolio" is gone.
* Footer shows only what the profile contains: location, email, GitHub, LinkedIn, Instagram, WhatsApp, "Available for new projects" (only if `available_for_work`).
* Local time uses the fixed zone `Africa/Dar_es_Salaam` (EAT, no daylight saving) and is labelled EAT. It updates once a minute and pauses while the tab is hidden.

## Layout contract for pages

`--navbar-h` is set by the Navbar to a **fixed 80 px** (12 px gap + 64 px bar + 4 px air). It deliberately does not follow the shrinking bar, so content never moves when the bar shrinks (CLS). Pages keep using `padding-top: calc(var(--navbar-h) + ...)`.

## Accessibility notes

Landmarks: one `<header>` with `<nav aria-label="Primary">`, one `<main id="main-content">`, one `<footer>` with `<nav aria-label="Footer">`. Touch targets are at least 44 px. External links announce "(opens in a new tab)". The decorative wordmark and 404 numeral are `aria-hidden`.
Axe (wcag2a/aa/21aa/22aa) reported 0 violations on the 404 page in dark and light in the headless run described in CHANGES.md.
