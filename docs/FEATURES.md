# Features

## Public site
- **Home** — hero, about summary, skills preview, featured projects, contact form
- **About** — full bio and quick stats
- **Skills** — proficiency bars grouped by category
- **Experience** — work history and education timelines
- **Projects** — searchable/filterable grid + individual project detail pages with galleries
- **Blog** — published articles with tags, view counts, and full Markdown support (write/preview
  toggle in the admin editor, rendered with GitHub-flavored Markdown on the public post page)
- **Resume** — printable summary of profile, experience, and skills, with a resume download link
- **Contact** — public contact form that emails the admin and stores the message

## Admin dashboard (`/admin`)
- **Login** — single-admin JWT authentication (email + bcrypt-hashed password from env)
- **Profile** — edit bio/contact/social links, upload avatar and resume to Supabase Storage
- **Projects** — full CRUD with cover image upload, tags, featured flag, draft/published status
- **Blog** — full CRUD for posts with tags and draft/published status
- **Settings** — edit site-wide settings, view incoming contact messages, and a 30-day traffic summary

## Architecture patterns used
- **Repository pattern** — `BaseModel` gives every resource generic CRUD; subclasses add
  resource-specific queries (search, slugs, JSON fields).
- **Service layer** — `BaseService` (abstract CRUD + lifecycle hooks) is extended by
  `ProjectService`/`BlogService` for slug generation and publish-date handling.
- **Strategy/interface pattern** — `StorageProvider` (→ `SupabaseStorageProvider`) and
  `NotificationService` (→ `EmailNotification`) let the storage/notification backend
  be swapped without touching callers.
- **Centralized error handling** — `AppError` + a single Express error-handling middleware.

## Not yet implemented
See `docs/ROADMAP.md`.
