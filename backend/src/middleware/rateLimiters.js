const rateLimit = require('express-rate-limit');
const { ApiResponse } = require('../utills/responce');

/**
 * Rate limiters scoped to authentication endpoints — layered on top of the
 * API-wide limiter already applied in server.js (300 req / 15 min). Login
 * and 2FA-code guessing need a much tighter window than everyday API
 * traffic, since each request there is effectively a credential guess.
 */
function jsonRateLimitHandler(req, res) {
  ApiResponse.error(res, {
    statusCode: 429,
    message: 'Too many attempts — please wait a few minutes and try again',
  });
}

/**
 * Guards POST /auth/login and POST /auth/login/verify together (sharing
 * one limiter caps total login attempts per IP across both steps, so an
 * attacker can't dodge the limit by splitting guesses between the
 * password step and the MFA-code step). `skipSuccessfulRequests` means
 * only failed attempts count, so a legitimate admin who mistypes a
 * password once isn't penalized after getting it right.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: jsonRateLimitHandler,
});

/**
 * Guards POST /auth/refresh. Looser than the login limiter — legitimate
 * clients call this automatically whenever the access token expires — but
 * still caps repeated invalid/expired/reused-token attempts, which is
 * what actually matters here (refresh-token guessing/replay).
 */
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: jsonRateLimitHandler,
});

module.exports = { loginLimiter, refreshLimiter };
