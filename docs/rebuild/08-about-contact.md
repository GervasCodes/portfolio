# Phase 8 — About and Contact (done)

**Assumption:** the plan doesn't define Phase 8, so I took it as the About and Contact pages, which is where the earlier phases deferred the Skills/Experience merge.

## Changes
- **About (`/about`)** is now the single page for profile, Experience, Education, Skills and Certificates/Achievements, in that order. The invented stats ("3+ Projects", "3+ Clients", the default "3+ years"), the fallback bio and all sample data are removed. Role, location and years of experience show only if set in the profile.
- **Timeline** is plain rows (dates | role, organisation, description) instead of cards with a dot rail.
- **Redirects:** `/skills` → `/about#skills`, `/experience` → `/about#experience` (the page scrolls to the section once data loads). `/profile` and `/contacts` already redirect from Phase 4.
- **Contact (`/contact`):** visible labels (the old form used placeholders with screen-reader-only labels), shared Field/Input/Textarea components, no icons or card around the form, no sample email.
- **Deleted:** `SkillsPage.jsx`, `ExperiencePage.jsx`, `ProfilePage.jsx`.
- **`public/sitemap.xml`:** removed /skills and /experience, renamed /contacts to /contact.

## Not done
- Sitemap entries still use `https://example.com`; set your real domain before launch.
- Blog and Resume pages were not touched.

## Verification
lint 0 errors (same 5 old warnings) · build passes · `check:design` passes. Not viewed in a browser, and the hash scroll has not been tested against live data.

---

## Phase 5 (redesign v2): About page

One page holds the story, skills, experience, education and credentials. `/skills`, `/experience` and `/profile` still redirect here; `#skills`, `#experience`, `#education` and `#recognition` are valid anchors.

**Sections** (each is left out when the CMS has no data for it; if all are empty a designed empty state shows):
1. Intro: name (last word in italic serif), first bio paragraph as the lede, facts (role, location, years, only when set), availability pill only if the profile says available, portrait in the Home hero's duotone treatment (placeholder art plus initials when there is no avatar), CTAs, in-page jump links.
2. Skills: bento grid, one tile per category, largest first. Row spans come from `bentoSpans(n)` so rows are always full (4-column) and pair up on 2 columns.
3. Experience and education: timelines with a scroll-linked accent line (transform driven by a framer-motion motion value; full and static under reduced motion). Durations are computed from the real dates.
4. Recognition: certificates (badge image, credential link) and achievements (cover plus gallery) opening the shared keyboard-accessible lightbox.
5. Resume panel: PDF download (if `resume_url`) and the printable page.

**Skill levels** are drawn with `LevelBar` (CSS, no chart library; the baseline uses `--control`, the number is in sr-only text). Bars appear only when at least two different `proficiency` values exist, because every skill created in the admin starts at 80 and identical bars would claim something the owner never rated. Otherwise tiles list plain tags.

**Dates** are formatted in UTC (MySQL DATE comes through as UTC midnight) so visitors west of UTC do not see the previous month. `is_current` arrives as 0/1; always coerce it before using it in JSX.

Helpers live in `utils/aboutContent.js` (pure, unit-tested during Phase 5).

---

## Phase 6 (redesign v2): Contact

`/contact` is a two-column page: the story and direct channels on the left, the form in a raised card on the right.

- **Direct channels** come from the profile and are left out when empty: email (mailto plus a copy button), WhatsApp (`whatsapp_number`, digits only, `wa.me`), GitHub / LinkedIn / X / Instagram, an availability pill only if `available_for_work`, and "Based in {location} · HH:MM EAT" only when a location is set. **Typical reply time is not shown**: the CMS has no such field (see CHANGES.md for the proposal).
- **Form**: same four fields posted as before (`name`, `email`, `subject`, `message`), trimmed. Validation mirrors the backend limits (name 1-100, valid email, message 5-5000, subject <= 200) and runs on submit and, once a field has been left, as the visitor types. The first problem is focused; errors are tied to their fields with `aria-describedby`. A server error (including the rate limit) is shown in an alert with the visitor's text kept and the email address as a fallback. Success replaces the form with a thank-you panel (focus moves to its heading) and a "Send another message" button.
- **Spam protection is untouched**: it is the server's rate limiter (5 per 15 minutes per IP). No honeypot or captcha was added.
- `index.css`: untouched required fields no longer show the error border (`:user-invalid` replaces the old `:invalid` rule for inputs without a placeholder).
