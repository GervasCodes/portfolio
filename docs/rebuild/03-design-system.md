# Phase 3, Step B — Design system (done, on Direction B)

**Assumption:** you replied "continue" without choosing a direction, so I built **Direction B (quiet editorial)**, my
recommendation. Colours, fonts and radius live in one file (`frontend/src/styles/tokens.css`), so switching to Direction A or
adding a dark theme later is a change to that file, not to components. Tell me if you want A and I will swap the tokens.

## What changed
- **Tokens:** `src/styles/tokens.css` (colour channels, fonts, radius, overlay shadow, motion durations, type and spacing
  scales). `tailwind.config.js` now reads them, so `text-ink/70`, `bg-accent/10` etc. keep working.
- **Palette renamed:** `bg, surface, ink, muted, line, accent (+ accent-ink), danger, success, warning`. The misleading
  `cyan.accent` and `accent-light/dark/glow` are gone. Red/green/amber Tailwind colours were mapped to the status tokens.
- **Type scale in Tailwind:** `text-xs … text-7xl` now equal 13 · 15 · 17 · 20 · 25 · 31 · 39 · 49 · 61 · 76 · 95 px.
- **Radius limited to two values** (0 and 8px, plus `full` for avatars/dots) and **shadows to overlays only**; every existing
  `rounded-*` and `shadow-*` utility resolves to one of them.
- **Fonts self-hosted** (`@fontsource-variable/hanken-grotesk`, `newsreader`); Google Fonts links removed from `index.html`.
- **Removed template effects** across 50 files: `glass`, `glass-hover`, `card-premium`, `text-gradient`, gradient buttons and
  overlays, `shadow-glow`, `backdrop-blur`, `bg-noise`, float/shine/ping animations, the Hero's blurred blobs, shine sweep,
  pulsing "available" pill, bouncing scroll cue and gradient avatar ring. Replacements: `.surface`, `.surface-hover`, `.card`.
- **Stock photos removed** from Hero and About (About shows the profile photo only if one exists).
- **Primitives** in `src/components/ui/`: Button/IconButton (rewritten flat), Card, Tag, TextLink, SectionHeader, Prose,
  Field + Input/Textarea/Select (label, hint, error wired for screen readers), Table, EmptyState, ErrorState, Toast
  (`useToast`, errors persist until dismissed), Skeleton (calm pulse), Modal (flat), Markdown (shared prose styles).
- **`/dev/styleguide`** shows every component in every state. It is registered behind `import.meta.env.DEV`; I checked the
  production bundle and it is not included.
- **Print styles** rewritten for the new tokens.
- **Guard:** `npm run check:design` fails if any banned class or pattern (glass, gradients, glow, blur, looping animations,
  Pexels images, old palette names) returns. It is not wired into CI yet (Phase 11).

## Verification
| Check | Result |
|---|---|
| `npm run lint` | 0 errors, 5 warnings (the same pre-existing ones) |
| `npm run build` | passes |
| `npm run check:design` | passes |
| Styleguide in production bundle | not present |
| Rendering | Checked in headless Chromium at 1280px and 375px (screenshots in `docs/rebuild/screenshots/`). The API is unreachable in my sandbox, so pages show their sample-data fallback, and external images could not load |
| Contrast (WCAG AA) | text 17.76, muted 6.81, accent 9.61, danger 7.12, success 6.82, warning 5.66, button text on accent 10.05; `text-ink/60` ≈ 4.8, so opacities below 60% were converted to `muted`; form borders use `muted` |

## Behaviour changes to be aware of
- `Button` with a `mailto:`, `tel:` or `#` link no longer opens a new tab (it did before). Web URLs still open in a new tab.
- Blog content was using `prose` classes but `@tailwindcss/typography` was never installed, so posts were effectively unstyled.
  I wrote real `.prose` styles instead of adding the plugin.
- Hero is an **interim** flat version (name, role, tagline, two buttons). The real structure comes in Phase 5.

## Known leftovers (planned, not forgotten)
- Navbar still has its floating panel, scroll-progress bar and the brand text lacks a space ("GERRY'SPortfolio") — Phase 4.
- Hardcoded "3+ Projects / 3+ Clients" stats, skill percentage bars/radar, and scroll-reveal on every section — Phases 5 and 7.
  Because content below the fold is revealed on scroll, full-page screenshots show blank gaps; that is the animation, not a bug.
- Many headings still use `font-bold` in the serif face, which is heavier than the design intends; tuned per page in Phases 4–8.
- The primary font is not preloaded (fontsource files are hashed by Vite); measure in Phase 10.
