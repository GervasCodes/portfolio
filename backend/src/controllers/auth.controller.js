const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const adminModel = require('../models/Admin');
const totpService = require('../services/totp.service');
const refreshTokenService = require('../services/refreshToken.service');
const { parseDurationMs } = require('../utills/duration');
const { ApiResponse, AppError } = require('../utills/responce');
const { asyncHandler } = require('../middleware/error.middleware');
const Validator = require('../utills/validator');

/**
 * Single-admin authentication, hardened with optional TOTP 2FA and
 * refresh-token rotation.
 * Credentials are seeded into the `admins` table at startup by adminInit.service.
 * Login verifies the bcrypt hash stored in the database — the plain-text
 * password from .env is only read once at boot time and never used here.
 *
 * Flow when 2FA is OFF (default until the admin opts in via /2fa/enable):
 *   POST /login -> session issued immediately, same as before.
 *
 * Flow when 2FA is ON:
 *   POST /login          -> password checked, but instead of a session the
 *                            response carries a short-lived `mfaToken`
 *                            (5 min) and no cookies are set yet.
 *   POST /login/verify   -> `mfaToken` + 6-digit authenticator code ->
 *                            session issued.
 *
 * A "session" is now a pair of cookies:
 *   - `token`         — short-lived (JWT_EXPIRES_IN, default 15m) JWT
 *                       access token, verified by requireAuth on every
 *                       protected request.
 *   - `refresh_token` — long-lived (REFRESH_TOKEN_EXPIRES_IN, default 30d)
 *                       opaque token, scoped to /api/auth, used only to
 *                       mint a new pair via POST /auth/refresh. Each use
 *                       rotates it (see refreshToken.service.js).
 */
function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

function signMfaToken(admin) {
  return jwt.sign(
    { sub: admin.id, email: admin.email, purpose: 'mfa' },
    env.JWT_SECRET,
    { expiresIn: env.MFA_TOKEN_EXPIRES_IN }
  );
}

function setAccessCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.isProduction(),
    sameSite: 'lax',
    maxAge: parseDurationMs(env.JWT_EXPIRES_IN, 15 * 60 * 1000),
  });
}

function setRefreshCookie(res, rawToken, ttlMs) {
  res.cookie('refresh_token', rawToken, {
    httpOnly: true,
    secure: env.isProduction(),
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: ttlMs,
  });
}

function clearSessionCookies(res) {
  res.clearCookie('token');
  res.clearCookie('refresh_token', { path: '/api/auth' });
}

/** Issues a full admin session: sets the access + refresh cookies and returns the access token. */
async function issueSession(req, res, admin) {
  const token = signAccessToken({ email: admin.email, role: admin.role });
  setAccessCookie(res, token);

  const { raw, ttlMs } = await refreshTokenService.issue(admin.id, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  setRefreshCookie(res, raw, ttlMs);

  return token;
}

const login = asyncHandler(async (req, res) => {
  const email = Validator.isEmail(req.body.email);
  const password = Validator.isString(req.body.password, 'password', { min: 1 });

  // Always look up the DB record — this is the single source of truth for
  // credentials and supports future multi-admin scenarios without code changes.
  const admin = await adminModel.findByEmail(email);

  // Use a constant-time compare even on the "not found" path to prevent
  // timing-based user enumeration attacks.
  const hashToCompare = admin?.password ?? '$2a$12$invalidhashpaddingtomatchbcryptlength00000000000000';
  const isValid = await bcrypt.compare(password, hashToCompare);

  if (!admin || !isValid) {
    throw AppError.unauthorized('Invalid credentials');
  }

  if (admin.totp_enabled) {
    const mfaToken = signMfaToken(admin);
    return ApiResponse.success(res, {
      message: 'Authentication code required',
      data: { mfaRequired: true, mfaToken },
    });
  }

  const token = await issueSession(req, res, admin);
  return ApiResponse.success(res, {
    message: 'Login successful',
    data: { token, user: { email: admin.email, role: admin.role } },
  });
});

/** Second step of login when the admin has 2FA enabled. */
const verifyMfa = asyncHandler(async (req, res) => {
  const mfaToken = Validator.isString(req.body.mfaToken, 'mfaToken', { min: 1 });
  const code = Validator.isString(req.body.code, 'code', { min: 6, max: 6 });

  let payload;
  try {
    payload = jwt.verify(mfaToken, env.JWT_SECRET);
  } catch (_err) {
    throw AppError.unauthorized('Your session expired — please log in again');
  }
  if (payload.purpose !== 'mfa') {
    throw AppError.unauthorized('Invalid authentication session');
  }

  const admin = await adminModel.findById(payload.sub);
  if (!admin || !admin.totp_enabled || !admin.totp_secret) {
    throw AppError.unauthorized('Invalid authentication session');
  }

  const isValid = totpService.verifyToken(admin.totp_secret, code);
  if (!isValid) {
    throw AppError.unauthorized('Invalid authentication code');
  }

  const token = await issueSession(req, res, admin);
  return ApiResponse.success(res, {
    message: 'Login successful',
    data: { token, user: { email: admin.email, role: admin.role } },
  });
});

/**
 * Exchanges the refresh_token cookie for a new access+refresh pair.
 * The old refresh token is revoked as part of rotation — see
 * refreshToken.service.js for reuse-detection behaviour.
 */
const refresh = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.refresh_token;

  let rotated;
  try {
    rotated = await refreshTokenService.rotate(rawToken, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  } catch (err) {
    // Whatever went wrong (missing/invalid/expired/reused token), the
    // client no longer has a usable session — clear cookies so it doesn't
    // keep retrying with a dead refresh token.
    clearSessionCookies(res);
    throw err;
  }

  const admin = await adminModel.findById(rotated.adminId);
  if (!admin) {
    clearSessionCookies(res);
    throw AppError.unauthorized('Invalid session');
  }

  const token = signAccessToken({ email: admin.email, role: admin.role });
  setAccessCookie(res, token);
  setRefreshCookie(res, rotated.raw, rotated.ttlMs);

  return ApiResponse.success(res, {
    message: 'Session refreshed',
    data: { token, user: { email: admin.email, role: admin.role } },
  });
});

const logout = asyncHandler(async (req, res) => {
  await refreshTokenService.revoke(req.cookies?.refresh_token);
  clearSessionCookies(res);
  return ApiResponse.success(res, { message: 'Logged out' });
});

const me = asyncHandler(async (req, res) => {
  // req.user only carries what was embedded in the JWT (email, role); look
  // the admin up fresh so the client can reflect current 2FA status without
  // a separate round trip.
  const admin = await adminModel.findByEmail(req.user.email);
  return ApiResponse.success(res, {
    data: { user: { ...req.user, totpEnabled: Boolean(admin?.totp_enabled) } },
  });
});

/** Starts 2FA enrollment: generates+stores a secret and returns a QR code to scan. Idempotent while not yet enabled — re-calling restarts setup with a fresh secret. */
const setupTotp = asyncHandler(async (req, res) => {
  const admin = await adminModel.findByEmail(req.user.email);
  if (!admin) throw AppError.unauthorized('Invalid session');
  if (admin.totp_enabled) throw AppError.conflict('Two-factor authentication is already enabled');

  const { base32, otpauthUrl } = totpService.generateSecret(admin.email);
  await adminModel.setTotpSecret(admin.id, base32);
  const qrCodeDataUrl = await totpService.toQrCodeDataUrl(otpauthUrl);

  return ApiResponse.success(res, {
    message: 'Scan the QR code with your authenticator app, then confirm a code to finish setup',
    data: { secret: base32, otpauthUrl, qrCodeDataUrl },
  });
});

/** Confirms enrollment: proves the admin actually captured the secret before 2FA is enforced. */
const enableTotp = asyncHandler(async (req, res) => {
  const code = Validator.isString(req.body.code, 'code', { min: 6, max: 6 });
  const admin = await adminModel.findByEmail(req.user.email);
  if (!admin) throw AppError.unauthorized('Invalid session');
  if (admin.totp_enabled) throw AppError.conflict('Two-factor authentication is already enabled');
  if (!admin.totp_secret) throw AppError.badRequest('Start setup first via GET /auth/2fa/setup');

  const isValid = totpService.verifyToken(admin.totp_secret, code);
  if (!isValid) throw AppError.unauthorized('Invalid authentication code');

  await adminModel.enableTotp(admin.id);
  return ApiResponse.success(res, { message: 'Two-factor authentication enabled' });
});

/** Disables 2FA. Requires the current password as a second confirmation, since this lowers account security. */
const disableTotp = asyncHandler(async (req, res) => {
  const password = Validator.isString(req.body.password, 'password', { min: 1 });
  const admin = await adminModel.findByEmail(req.user.email);
  if (!admin) throw AppError.unauthorized('Invalid session');

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) throw AppError.unauthorized('Invalid password');

  await adminModel.disableTotp(admin.id);
  return ApiResponse.success(res, { message: 'Two-factor authentication disabled' });
});

module.exports = { login, verifyMfa, refresh, logout, me, setupTotp, enableTotp, disableTotp };
