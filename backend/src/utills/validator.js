const { AppError } = require('./responce');

/**
 * Lightweight, dependency-free validation helpers.
 * Each function either returns the cleaned value or throws an AppError,
 * so controllers can validate in one line: `const email = isEmail(req.body.email)`.
 */
const Validator = {
  isRequired(value, field) {
    if (value === undefined || value === null || String(value).trim() === '') {
      throw AppError.badRequest(`${field} is required`);
    }
    return value;
  },

  isEmail(value, field = 'email') {
    Validator.isRequired(value, field);
    const trimmed = String(value).trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(trimmed)) throw AppError.badRequest(`${field} must be a valid email address`);
    return trimmed.toLowerCase();
  },

  isString(value, field, { min = 0, max = Infinity } = {}) {
    Validator.isRequired(value, field);
    const str = String(value);
    if (str.length < min) throw AppError.badRequest(`${field} must be at least ${min} characters`);
    if (str.length > max) throw AppError.badRequest(`${field} must be at most ${max} characters`);
    return str.trim();
  },

  isOneOf(value, field, allowed = []) {
    if (!allowed.includes(value)) {
      throw AppError.badRequest(`${field} must be one of: ${allowed.join(', ')}`);
    }
    return value;
  },

  isArray(value, field) {
    if (!Array.isArray(value)) throw AppError.badRequest(`${field} must be an array`);
    return value;
  },

  isBoolean(value) {
    return value === true || value === 'true' || value === 1 || value === '1';
  },

  toSlug(value) {
    return String(value)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  },

  paginationParams(query) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
    const offset = (page - 1) * limit;
    return { page, limit, offset };
  },
};

module.exports = Validator;
