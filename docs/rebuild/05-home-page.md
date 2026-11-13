# Phase 5 — Home page (done)

Built to the 5-section structure in `01-ia-and-content.md`. Copy comes from Admin → Profile and the CMS, so the
bracketed placeholders in the Phase 1 draft are not baked into code; fill them in the admin.

## Sections
1. **Hero:** role label, name, tagline, optional "Based in X. Open to new work." line (only if set in the profile), CTAs "See the work" / "Get in touch".
2. **Selected work:** up to 3 featured projects as plain rows (title, category, summary, 5 tags, link to case study). Hidden if none.
3. **About:** the profile bio trimmed to about 320 characters, link to `/about`. Hidden if no bio.
4. **Recent writing:** latest 3 posts, hidden if there are none.
5. **Contact:** heading, one button to `/contact`, profile email as a link. No form.

## Removed from Home
Stats row, certificates/achievements strip, skills grid, duplicate contact form, scroll-reveal animations, and all sample-data fallbacks (`sampleProfile/Skills/Projects`), which contained invented claims. If the API returns nothing, Home shows a bare hero rather than fake content.

## Files
`pages/HomePage.jsx`, `components/sections/Hero.jsx`, new `components/sections/HomeSections.jsx`. The old About, Skills, Projects, Contacts and Certificates sections are untouched because other pages still use them (Projects.jsx is now unused).

## Verification
lint 0 errors (same 5 old warnings) · build passes · `check:design` passes. Not viewed in a browser; the API is unreachable from my sandbox.

## Needs your content in the admin
Tagline, bio, location, availability, 3 featured projects with summaries and case studies, public email.
