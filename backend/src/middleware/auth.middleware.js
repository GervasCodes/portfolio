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

module.exports = { requireAuth, attachUserIfPresent };
