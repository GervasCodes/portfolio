const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const db = require('./config/database');
const { initializeAdmin } = require('./services/adminInit.service');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const projectRoutes = require('./routes/project.routes');
const projectMediaRoutes = require('./routes/projectMedia.routes');
const blogRoutes = require('./routes/blog.routes');
const skillsRoutes = require('./routes/skills.routes');
const experienceRoutes = require('./routes/experience.routes');
const mediaRoutes = require('./routes/media.routes');
const contactRoutes = require('./routes/contact.routes');
const miscRoutes = require('./routes/misc.routes');
const searchRoutes = require('./routes/search.routes');
const newsletterRoutes = require('./routes/newsletter.routes');

const app = express();

// Render (like most PaaS hosts) puts the app behind a reverse proxy, which
// sets X-Forwarded-For/Proto on every request. Without telling Express to
// trust that proxy, two things break: express-rate-limit can't safely
// derive a per-client key from X-Forwarded-For (see the
// ERR_ERL_UNEXPECTED_X_FORWARDED_FOR warning this used to throw on every
// request) and req.secure/req.protocol are wrong, which matters for the
// `secure`/cross-site cookie logic in auth.controller.js. `1` trusts
// exactly one hop (Render's own proxy), which is correct for this setup.
app.set('trust proxy', 1);

// --- Global middleware ---
// This backend is a pure JSON API — it never serves HTML pages, inline
// scripts/styles, fonts, or images itself (uploaded media goes straight to
// Supabase Storage; the frontend is a separately-deployed static site).
// Helmet's default CSP is tuned for an app that renders pages, so it's
// replaced here with a near-default-deny policy that actually matches
// what this service does: nothing should ever load or execute content
// framed/embedded from this origin.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'none'"],
      formAction: ["'none'"],
    },
  },
}));
// Multiple allowed origins (see CLIENT_URLS in config/env.js) instead of a
// single fixed one, so a staging/preview frontend domain can be added via
// env var alone. `cors`'s origin callback checks the request's actual
// Origin header against the allow-list; requests with no Origin header
// (server-to-server, curl, the health check) are allowed through since
// they aren't subject to browser CORS anyway.
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.CLIENT_URLS.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.isProduction() ? 'combined' : 'dev'));

// Basic API-wide rate limiting for everything under /api. Auth endpoints
// get their own, much stricter limiters on top of this (see
// routes/auth.routes.js + middleware/rateLimiters.js).
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

// --- Health check ---
app.get('/api/health', (_req, res) => res.json({ status: 'ok', env: env.NODE_ENV }));

// --- Routes ---
// Mounted under both `/api/...` (unversioned — kept working so the
// currently-deployed frontend, which calls `/api/...` directly, isn't
// broken by this change) and `/api/v1/...` (the new, versioned path).
// Same router instances at both prefixes — this is routing-only, no
// route logic changes. New API consumers should prefer `/api/v1/...`;
// the unversioned path is expected to eventually be deprecated once the
// frontend is updated to call the versioned path instead.
function mountRoutes(prefix) {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/profile`, profileRoutes);
  app.use(`${prefix}/projects`, projectRoutes);
  app.use(`${prefix}/projects`, projectMediaRoutes);
  app.use(`${prefix}/blog`, blogRoutes);
  app.use(`${prefix}/skills`, skillsRoutes);
  app.use(`${prefix}/experience`, experienceRoutes);
  app.use(`${prefix}/media`, mediaRoutes);
  app.use(`${prefix}/contact`, contactRoutes);
  app.use(`${prefix}/search`, searchRoutes);
  app.use(`${prefix}/newsletter`, newsletterRoutes);
  app.use(prefix, miscRoutes);
}
mountRoutes('/api');
mountRoutes('/api/v1');

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await db.testConnection();
    console.log('[db] Connected to MySQL');
  } catch (err) {
    console.error('[db] Failed to connect on startup — check DB_* env vars:', err.message);
    // Continue starting the server; public routes may still be reachable.
  }

  // Idempotent admin seeding — safe to run on every restart.
  await initializeAdmin();

  app.listen(env.PORT, () => {
    console.log(`[server] Portfolio API listening on port ${env.PORT} (${env.NODE_ENV})`);
  });
}

start();

module.exports = app;
