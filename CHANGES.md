# Changed files — fixes for email + admin edits "reverting"

Drop these into your repo at the matching paths (they mirror your project
structure: backend/... and frontend/...). All files were syntax-checked
(`node --check`) and the frontend build (`npm run build`) passes.

## New env vars needed on Render (backend service)

Set these, and you can delete the old SMTP_* ones — they're no longer used:

- `BREVO_API_KEY`      — from https://app.brevo.com/settings/keys/api
- `BREVO_SENDER_EMAIL` — must be a verified sender in Brevo (Settings -> Senders)
- `BREVO_SENDER_NAME`  — optional, defaults to "Portfolio"

## What changed

**backend/src/server.js**
- Added `app.set('trust proxy', 1)` — fixes the `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`
  warning in your logs and makes rate-limiting/IP detection behave correctly
  behind Render's proxy.

**backend/src/config/env.js**
- Replaced `SMTP_*` vars with `BREVO_API_KEY` / `BREVO_SENDER_EMAIL` / `BREVO_SENDER_NAME`.

**backend/src/services/email.service.js**
- Sends mail via the Brevo HTTP API instead of nodemailer/SMTP.

**backend/src/services/totp.service.js**
- Comment-only update (referenced nodemailer, now references Brevo).

**backend/src/controllers/auth.controller.js**
- Admin session cookies (`token`, `refresh_token`) now use `SameSite=None; Secure`
  in production instead of `SameSite=Lax`. This was the actual cause of your
  resume/experience edits appearing to "revert": your frontend and backend are
  on different Render subdomains, so `Lax` cookies were silently dropped on the
  cross-site refresh-token request. When your access token (15 min) expired
  mid-edit, the refresh silently failed, the save silently failed, and the
  page just reloaded the old unchanged data with no error shown.

**backend/src/controllers/blog.controller.js**
- Same cross-site cookie fix applied to the anonymous blog-viewer cookie.

**backend/package.json**
- Removed the now-unused `nodemailer` dependency.

**frontend/src/services/api.js**
- If a session refresh fails, the app now redirects to `/admin/login` instead
  of leaving you on a page where every subsequent save fails silently.

**frontend/src/pages/admin/AdminExperiencePage.jsx**
- Failed saves/deletes now show a visible red error banner and keep your
  entered data in the form, instead of silently discarding it and reloading
  the old data.

**frontend/src/pages/ExperiencePage.jsx** and **frontend/src/pages/ResumePage.jsx**
- These fell back to hardcoded sample/placeholder data whenever *any* API
  call failed (not just when genuinely empty) — indistinguishable from your
  real content vanishing. Now placeholder data is only used for a genuinely
  empty, successful response; failed requests just log to console instead.
