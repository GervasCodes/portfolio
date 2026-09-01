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

/**
 * Guards POST /contact. Sits underneath the API-wide 300/15min limiter,
 * but a public contact form is an easy target for spam/abuse scripts
 * that the generic limiter alone wouldn't catch quickly — this caps it
 * much tighter, per IP, regardless of success/failure (an attacker
 * doesn't need a "successful" submission to spam an inbox).
 */
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

/**
 * Guards POST /newsletter/subscribe. Same reasoning as contactLimiter —
 * a public signup endpoint that sends an email on every hit is an easy
 * way to spam a mailbox (someone else's, via the confirmation email) if
 * left uncapped beyond the generic API-wide limiter.
 */
const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

module.exports = { loginLimiter, refreshLimiter, contactLimiter, newsletterLimiter };
