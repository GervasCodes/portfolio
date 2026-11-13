# Phase 1 — Positioning, content and information architecture (DRAFT for approval)

Status: proposal built from the code and docs only. Items in [BRACKETS] need your real answers; nothing here is final until you approve it.

## 1. Positioning (draft)
> [Name] builds [type of product] for [audience]. I own the whole stack — design, API, database, deployment — and I write down the trade-offs.

Supporting proof points (fill with real, provable facts):
1. [One shipped project with a measurable result — e.g. users, response time, hours saved]
2. [One engineering decision you can explain, e.g. why a custom CMS instead of a headless one]
3. [One thing a visitor can verify: live site, public repo, or a client reference]

## 2. Proposed sitemap
| Page | Route | Decision |
|---|---|---|
| Home | `/` | Keep, 5 sections max (below) |
| Work | `/projects`, `/projects/:slug` | Keep URLs (no SEO loss); case-study format |
| About | `/about` | Absorbs `/profile`, `/skills`, `/experience`, certificates and achievements |
| Resume | `/resume` | Keep, single-column printable |
| Writing | `/blog`, `/blog/:slug` | Keep; **hide from nav until there are at least 3 posts** |
| Contact | `/contact` | Rename from `/contacts`; redirect old path |
| Search | `/search` | Keep, linked from a header icon |
| Newsletter confirm / unsubscribe | `/newsletter/*` | Keep, restyle only |
| 404 | `*` | Redesign |

Redirects: `/profile` → `/about`, `/skills` → `/about#skills`, `/experience` → `/about#experience`, `/contacts` → `/contact`.
Primary nav (5): Work · About · Writing · Resume · Contact.

## 3. Home page (5 sections)
| # | Section | Purpose | Single takeaway |
|---|---|---|---|
| 1 | Hero | Say who you are and what you do | "[Name] builds [X] for [Y]" |
| 2 | Selected work (3 projects) | Prove it | Real outcomes, real screenshots |
| 3 | How I work / Currently | Human detail | How you think and what you're on now |
| 4 | Writing (only if posts exist) | Show depth | You explain things clearly |
| 5 | Contact call to action | Convert | Email you directly |
Removed from Home: stats row, certificates/achievements strip, skills grid, duplicate contact form.

## 4. Page-by-page spec
| Page | Headline idea | Primary CTA | Content source |
|---|---|---|---|
| Home | Positioning sentence | See the work | CMS: profile, featured projects, latest posts |
| Work | "Selected work" with year and role per row | Open a case study | CMS: projects |
| Case study | Project title + one-line outcome | Visit live / view code | CMS: project + case-study fields |
| About | Short first-person story | Download resume / Contact | CMS: profile, experience, skills, certificates |
| Resume | Name and title | Download PDF | CMS + uploaded PDF |
| Writing | Post titles with reading time | Read | CMS: blog |
| Contact | "Tell me about the project" | Send message | Form + profile email |

## 5. Draft copy (replace brackets; keep the structure)
**Hero**
- H1: [Name] — [what you build].
- Support: "[One concrete sentence about what you shipped.] [One sentence about how you work.]"
- Status line (plain text, only if true): "Based in [city]. Open to [freelance / full-time] from [month]."
- CTAs: "See the work" · "Get in touch".

**About (opening)**
"I'm a [role] based in [city]. I started building [what] in [year] because [real reason]. Since then I've shipped [N real things]. The one I'm proudest of is [project], where [specific result]."

**Project summary template**
"[Project] is a [type] for [who]. I [role]. The hard part was [problem]; I chose [decision] over [alternative] because [reason]. Result: [number]."

## 6. Case-study template
Context · My role and dates · Problem · Decisions and trade-offs · Architecture (diagram) · Result (with numbers) · What I would change · Links (live, repo).

## 7. Voice guide
1. First person, present tense for who you are, past tense for what you built.
2. One idea per sentence; aim for under 22 words.
3. Name specific tools, numbers and places instead of adjectives.
4. Say what you chose and what you rejected.
5. Admit limits ("I haven't done X at scale") — it builds trust.
6. No filler: passionate, cutting-edge, seamless, robust, world-class, leverage, "turning ideas into", "crafting experiences".
7. No claim without proof available on the page or behind a link.
8. Headings say what the section is, not a slogan.
9. Link text describes the destination ("read the case study"), never "click here".
10. Read it aloud; rewrite anything you wouldn't say to a person.

## 8. Claims on the current site to remove or prove
- "3+ Projects Shipped" and "3+ Happy Clients" (hardcoded in `About.jsx`).
- Skill proficiency percentages (90%, 85%, ...) and the radar chart.
- "Available for new opportunities — freelance & full-time" unless that is currently true (it is driven by `available_for_work`).
- The fallback bio ("passionate software engineer ... delightful user experiences").
- "Turning ideas into reliable software" (About headline) and "Production-grade" language in the default tagline.
- Stock "developer workspace" photo and hero background photo.
- Footer GitHub/LinkedIn placeholder links, example.com email, `VITE_SITE_URL` default.

## 9. Content I need from you
- **Home/About:** photo (or decision to go without), 2–3 sentence real bio, city, availability and what kind of work.
- **Projects (per flagship):** role, year, problem, key decision, result with a number, 2–4 real screenshots, live and repo links.
- **Experience/education:** roles with dates and outcome-style bullets.
- **Skills:** the 10–15 tools you actually use, and which project proves each.
- **Links:** real GitHub, LinkedIn, public email, WhatsApp (if public).
- **Resume:** current PDF.
- **Blog:** any existing posts, or a decision to hide Writing for now.

## 10. Questions for you (answer in one reply)
1. Who is the main audience: employers, freelance clients, or both?
2. Which 3 projects are your flagships (names + one line each)?
3. What provable numbers can you state (users, speed, savings, years, clients)?
4. Do you want to use your own photo, and is one available?
5. Are you open to full-time, freelance, or both right now — and from when?
6. Which language(s) should the site be in: English only, or English + Swahili?
7. Do you already own a domain (for same-site cookies and clean URLs)? Which?
8. Do you have blog posts, or should Writing stay hidden until you do?
9. Which sites do you like the look of (2–3 links) and which do you dislike?
10. Any pages or features in the current site you want to keep exactly as they are?
