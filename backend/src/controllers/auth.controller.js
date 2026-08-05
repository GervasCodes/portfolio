const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const adminModel = require('../models/Admin');
const { ApiResponse, AppError } = require('../utills/responce');
const { asyncHandler } = require('../middleware/error.middleware');
const Validator = require('../utills/validator');

/**
 * Single-admin authentication.
 * Credentials are seeded into the `admins` table at startup by adminInit.service.
 * Login verifies the bcrypt hash stored in the database — the plain-text
 * password from .env is only read once at boot time and never used here.
 */
function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
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

  const token = signToken({ email: admin.email, role: admin.role });

  res.cookie('token', token, {
    httpOnly: true,
    secure: env.isProduction(),
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return ApiResponse.success(res, {
    message: 'Login successful',
    data: { token, user: { email: admin.email, role: admin.role } },
  });
});

const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('token');
  return ApiResponse.success(res, { message: 'Logged out' });
});

const me = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, { data: { user: req.user } });
});

module.exports = { login, logout, me };
