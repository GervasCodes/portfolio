const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { ApiResponse, AppError } = require('../utills/responce');
const { asyncHandler } = require('../middleware/error.middleware');
const Validator = require('../utills/validator');

/**
 * Single-admin authentication. There is exactly one privileged user
 * (the portfolio owner), so credentials live in the environment rather
 * than a `users` table — simpler and one less thing to secure.
 */
function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

const login = asyncHandler(async (req, res) => {
  const email = Validator.isEmail(req.body.email);
  const password = Validator.isString(req.body.password, 'password', { min: 1 });

  if (email !== env.ADMIN_EMAIL.toLowerCase()) {
    throw AppError.unauthorized('Invalid credentials');
  }

  const isValid = env.ADMIN_PASSWORD_HASH
    ? await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH)
    : false;

  if (!isValid) throw AppError.unauthorized('Invalid credentials');

  const token = signToken({ email, role: 'admin' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: env.isProduction(),
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return ApiResponse.success(res, {
    message: 'Login successful',
    data: { token, user: { email, role: 'admin' } },
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
