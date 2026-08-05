# Deployment

## Prerequisites
- Aiven MySQL service (or any MySQL 8+ with SSL)
- Supabase project with a Storage bucket (default name: `portfolio-media`, set it to public)
- SMTP credentials for contact-form email notifications (optional but recommended)

## Backend (Render — Web Service)
1. Push this repo to GitHub.
2. Render → New → Web Service → point at `backend/`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all variables from `.env.example` under Environment.
6. After the first deploy, run migrations once (Render Shell or locally against the
   same DB): `npm run migrate && npm run seed`.

## Frontend (Render — Static Site or Vercel)
1. Point at `frontend/`.
2. Build command: `npm install && npm run build`
3. Set `NEXT_PUBLIC_API_URL` to your deployed backend's `/api` URL.
4. On Render use a Web Service with `npm start` (Next.js needs a Node runtime for
   server components/API calls); on Vercel it works out of the box.

## Environment variables
See `.env.example` at the repo root — copy it to `backend/.env` for local dev, and
mirror the same keys in your hosting provider's dashboard for production.

## Generating the admin password hash
```
node -e "console.log(require('bcryptjs').hashSync('yourpassword', 10))"
```
Paste the output into `ADMIN_PASSWORD_HASH`.
