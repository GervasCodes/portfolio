const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { AppError } = require('../utills/responce');

/**
 * Protects admin-only routes. Expects a Bearer token (or `token` cookie),
 * verifies it, and attaches the decoded payload to `req.user`.
 */
function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const bearer = header.startsWith('Bearer ') ? header.slice(7) : null;
    const token = bearer || req.cookies?.token;

    if (!token) throw AppError.unauthorized('Authentication token missing');

    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Invalid or expired token'));
    }
    next(err);
  }
}

/**
 * CSRF guard for state-changing admin requests (POST/PUT/PATCH/DELETE).
 * Only matters when the request is authenticated purely by the `token`
 * cookie — that cookie is sent automatically by the browser on
 * cross-site requests too (SameSite=None in production, see
 * auth.controller.js), which is exactly what lets a malicious page ride
 * it without knowing its value. A request carrying its own
 * `Authorization: Bearer` header already proves the caller has the raw
 * token — something a cross-site form/script cannot obtain — so it
 * isn't subject to that vector and skips this check.
 *
 * Uses the standard double-submit pattern: login/refresh (see
 * auth.controller.js) set a non-httpOnly `csrf_token` cookie AND return
 * the same value in the JSON response body, so only same-origin JS that
 * actually read that response can know it and echo it back in the
 * `X-CSRF-Token` header. A cross-site attacker can make the browser send
 * the cookie automatically, but can't read it (or the login response)
 * to produce a matching header value.
 */
function verifyCsrf(req, res, next) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return next();

  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies?.csrf_token;
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(AppError.forbidden('Invalid or missing CSRF token'));
  }
  next();
}

/**
 * Optional auth: attaches req.user if a valid token is present,
 * but never blocks the request. Useful for endpoints that behave
 * slightly differently for the admin (e.g. showing drafts).
 */
function attachUserIfPresent(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const bearer = header.startsWith('Bearer ') ? header.slice(7) : null;
    const token = bearer || req.cookies?.token;
    if (token) {
      req.user = jwt.verify(token, env.JWT_SECRET);
    }
  } catch (_err) {
    // ignore invalid tokens on optional routes
  }
  next();
}

module.exports = { requireAuth, verifyCsrf, attachUserIfPresent };
