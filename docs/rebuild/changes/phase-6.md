# Phase 5 - About, Skills, Experience, Resume

## Files
Added
- frontend/src/utils/aboutContent.js - pure helpers (dates in UTC, durations, bento spans, skill grouping, "are levels meaningful", paragraphs, initials)
- frontend/src/components/ui/LevelBar.jsx - CSS skill bar, number in sr-only text
- frontend/src/components/about/Portrait.jsx - duotone portrait / placeholder art + initials

Changed
- frontend/src/pages/AboutPage.jsx - one rich page; skeleton, retry on total failure, designed empty state, resume panel, knowsAbout in Person JSON-LD; #skills/#experience/#education/#recognition anchors
- frontend/src/pages/ResumePage.jsx - single-column printable resume (profile, experience, education, skills, certificates), Download PDF + Print buttons
- frontend/src/components/sections/About.jsx - intro (story, portrait, facts, availability only if set, CTAs, jump links)
- frontend/src/components/sections/Skills.jsx - bento grid, largest category first, bars only when levels differ
- frontend/src/components/sections/Timeline.jsx - scroll-linked line timelines; ExperienceSection (work + education)
- frontend/src/components/sections/CertificatesAchievements.jsx - real images, keyboard lightbox, credential links
- frontend/src/index.css - .level-bar, .tl-track/.tl-dot, rewritten print block (A4, resume header kept, chrome hidden)
- docs/rebuild/08-about-contact.md, 09-blog-resume.md - Phase 5 sections appended
- DELETE-THESE-FILES.txt - updated list

## Decisions
- Bars show only if >=2 different proficiency values exist (admin default is 80, so identical bars would be a claim nobody made).
- Skill categories sorted largest first so bento tiles are full.
- Resume "Profile" = first paragraph of bio.
- Redirects (/skills, /experience, /profile) untouched in App.jsx.

## Verified (Chromium + fake API fixtures, production build)
- eslint clean, check:design passed, build OK (About 5.9 KB gzip, Resume 2.5 KB), helper unit tests pass.
- /about at 360/390/768/1024/1440, dark + light (390, 1440): no horizontal overflow, no console errors.
- Timeline line scroll-linked; lightbox keyboard open/Esc/focus return/arrow keys; redirects + hash anchors; reduced motion static; sparse, empty and error states.
- Bugs fixed: stray "0" (is_current 0/1), hollow text-only achievement card, heading claiming "worked" with only education.

- /resume on screen at 360/390/768/1024/1440: no overflow, no console errors.
- Print (Chromium, print media, @page honoured): white background and dark ink in BOTH dark and light themes, site chrome and buttons hidden, name/contact header present, dates on one line, 2 A4 pages for a full fixture. Two print bugs found and fixed (resume header hidden by the chrome rule; Letter size).
- axe-core (wcag2a/aa, 2.1 AA, 2.2 AA, best-practice): 0 violations on /about and /resume, dark and light.
- Touch targets at 390 px: nothing under 44 px in main on /about and /resume (resume contact links fixed).
- Jump link to #recognition settles at 96 px (was smooth scroll).
- check:design passed (50 contrast pairs, dark + light); all colours come from existing tokens, no new pairs.

## NOT verified
- Lighthouse (mobile) not run; no real LCP/CLS numbers. About chunk is 5.9 KB gzip, Resume 2.5 KB (build output).
- Real backend data: all browser checks used fake API fixtures. Check with your real CMS, especially skill proficiency values (bars only show if they differ) and image URLs.
- Firefox/Safari rendering and printing; real phone.
- Screen-reader pass by hand.

## Remaining for the project (later phases)
Phase 6 (Contact, Writing, Search, Newsletter) and Phase 7 (polish, Lighthouse, image pipeline, OG images, combined zip).

## Cleanup (still present in your upload; safe to delete)
frontend/src/utils/sampleData.js, frontend/src/pages/ProfilePage.jsx, frontend/src/pages/ExperiencePage.jsx, and (new) frontend/src/pages/SkillsPage.jsx (unrouted, /skills redirects); see DELETE-THESE-FILES.txt.

## Note
homeContent.js formatMonthYear uses local time; visitors west of UTC can see the previous month. Not touched.
