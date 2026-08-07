# Portfolio Frontend — Vite + React (migrated from Next.js)

This is the `frontend/` app converted from Next.js 14 (App Router) to
Vite + React + React Router, so it can be deployed as a plain static
site (Netlify, Vercel static hosting, GitHub Pages, S3, etc.) instead
of requiring a Node server.

## What changed

- **Routing**: `app/**/page.jsx` files → `src/pages/*.jsx`, wired up with
  `react-router-dom` in `src/App.jsx`. Dynamic segments (`[slug]`) became
  `:slug` route params via `useParams`.
- **Data fetching**: pages were Next.js async server components; they're
  now client components that fetch in `useEffect` (same API calls, same
  `PortfolioAPI` service, same fallback-to-sample-data behavior).
- **Metadata**: `export const metadata` / `generateMetadata` → a small
  `useDocumentTitle()` hook that sets `document.title`.
- **`next/link`** → `react-router-dom`'s `Link` (`href` → `to`).
- **`next/navigation`** (`useRouter`, `usePathname`) → `useNavigate`,
  `useLocation` / `useSearchParams` / `useParams`.
- **`next/image`** → plain `<img>` tags (the `fill` prop became
  `absolute inset-0 w-full h-full object-cover` on an already-relative
  parent).
- **`next/font/google`** → a Google Fonts `<link>` in `index.html`
  (same fonts: Inter, Space Grotesk — same CSS variable names, so
  `tailwind.config.js` / `globals.css` needed no changes).
- **Env vars**: `process.env.NEXT_PUBLIC_API_URL` → `import.meta.env.VITE_API_URL`.
  Copy `.env.example` to `.env` and set it for local dev; set the same
  var in your static host's build settings for production.
- **Dev API proxy**: `next.config.js`'s `rewrites()` → Vite's
  `server.proxy` in `vite.config.js` (same behavior: proxies `/api/*`
  to the backend during `npm run dev` only).
- Added `public/_redirects` (Netlify) and `vercel.json` (Vercel) so
  client-side routes like `/projects/some-slug` don't 404 on a hard
  refresh — any static host needs an "always serve index.html" rule
  for SPA routing to work.

## What did NOT change

- Every component's JSX, styling (Tailwind classes), and business logic.
- `services/api.js` / `services/upload.js` — same endpoints, same
  `{ data, error }` wrapper.
- `utils/sampleData.js` — untouched fallback content.
- The backend (`backend/`) and database (`database/`) folders — not
  part of this conversion; they're unaffected.

## Local development

```bash
npm install
cp .env.example .env   # then set VITE_API_URL if not using localhost:5000
npm run dev
```

## Building for static deployment

```bash
npm run build
```

Output goes to `dist/` — upload that directory to any static host.
