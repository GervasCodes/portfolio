# Phase 7 — Charts, skills and scroll-reveal (done)

## Changes
- **Skills:** the percentage bars, "category strength" radar and the stat cards are gone. `/skills` and the Skills section now show plain groups: category name, technologies as outlined tags. Sample-skills fallback removed; empty and loading states added.
- **recharts removed** from `package.json`, the lockfile and `vite.config.js` (the `vendor-charts` chunk was about 400 kB). The two admin charts (Skills average by category, newsletter signups over 30 days) now use a small plain HTML/CSS component, `components/ui/BarSeries.jsx`, which shows a text label and value for every bar.
- **Scroll-reveal removed** from About, Certificates/Achievements, Contacts and Timeline (no more `whileInView`). framer-motion stays for modals, the gallery, the admin sidebar and route transitions.
- **Deleted unused files:** `components/projects/ProjectCards.jsx`, `components/sections/Projects.jsx`.

## Not done
- The hardcoded "3+ Projects / 3+ Clients" stats in `About.jsx` are still there (the About page rewrite is not in this phase).
- `/skills` and `/experience` still exist as separate pages (redirect into About later).
- `pages/ProfilePage.jsx` is unused but still contains old animations.

## Verification
lint 0 errors, 5 warnings (the same old ones) · build passes · `check:design` passes. Not viewed in a browser, and the admin charts have not been tried with live data.
