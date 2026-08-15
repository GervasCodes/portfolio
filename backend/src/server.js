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
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
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
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects', projectMediaRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api', miscRoutes);

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
