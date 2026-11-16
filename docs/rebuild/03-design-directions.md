# Phase 3, Step A — Two visual directions (proposal, awaiting your choice)

Nothing in the real app has changed yet. Open `design-preview/index.html` (static HTML, placeholder content in [brackets]).
I could not render these in a browser here, so please check them at desktop and phone width and tell me what looks off.

Both directions follow the same rules: flat surfaces, 1px borders, no glass, no gradient text or buttons, no glow, no blobs,
no stock photos, shadows only for overlays, two radius values, one accent colour. The grid pattern in A's image placeholder is
a hairline motif, not a decorative gradient.

## Direction A — Engineering notebook
Warm paper background, near-black ink, one rust accent, monospace labels, index-style project lists with visible dividers.
Best if you want to look like an engineer who documents decisions.
| Token | Value |
|---|---|
| bg / surface | `#F4F1E8` / `#FBFAF5` |
| text / muted | `#1A1915` / `#5B574C` |
| line | `#D8D3C4` |
| accent / accent-ink | `#A8391B` / `#FBFAF5` |
| Fonts | IBM Plex Sans (headings + body), JetBrains Mono (labels, tags, indexes) |
| Radius | 2px (controls, tags), 4px (images, panels) |
Contrast (WCAG): text 15.58, muted 6.38, accent on bg 5.69, button text on accent 6.15 — all pass AA.

## Direction B — Quiet editorial
Off-white, large serif headings, generous whitespace, one deep-green accent, projects as magazine-style features.
Best if you want a calm, confident, more personal tone.
| Token | Value |
|---|---|
| bg / surface | `#FAFAF6` / `#FFFFFF` |
| text / muted | `#14130F` / `#5A5850` |
| line | `#E2DFD5` |
| accent / accent-ink | `#1D4A38` / `#FFFFFF` |
| Fonts | Newsreader (headings, lede), Hanken Grotesk (body, UI) |
| Radius | 0 (dividers, tags), 8px (buttons, images) |
Contrast (WCAG): text 17.76, muted 6.81, accent on bg 9.61, button text on accent 10.05 — all pass AAA/AA.

## Shared scales (both)
- **Type scale** (ratio ~1.25, base 17px): 13 · 15 · 17 · 20 · 25 · 31 · 39 · 49; hero uses `clamp()` up to 56px (A) / 76px (B).
- **Spacing** (4px base): 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128.
- **Line length:** body capped around 34–36em for text blocks; long-form posts 65–72 characters.
- **Motion tokens:** `--dur-fast 120ms`, `--dur-base 200ms`, `--ease cubic-bezier(.2,0,0,1)`. Three patterns only: hero entrance,
  hover/focus feedback, and overlay open/close. Everything respects `prefers-reduced-motion`.
- **Form fields** use the muted colour as their border (decorative `line` is only ~1.3:1, which is fine for dividers but not for inputs).
- Both support an optional dark theme later; not part of this step.

## What I recommend
**B for a personal brand aimed at clients or employers who skim**, **A if your work is mostly backend/systems and you want the
documentation-heavy feel.** Your current palette (sage and bronze) is not carried over in either, on purpose: it is part of why
the site reads as a template. If you want to keep a sage accent, say so and I will adapt either direction.

## Decision needed
1. Pick A, B, or a mix (for example A's layout with B's fonts).
2. Any colour you must keep or avoid?
3. Dark theme: needed at launch, later, or never?
After that I run Step B: tokens in `tailwind.config.js`, self-hosted fonts, removal of `glass`, `card-premium`, `text-gradient`
and friends (about 140 usages), the primitives (Button, Field, Card, Table, Modal, Toast...) and a `/dev/styleguide` route.
