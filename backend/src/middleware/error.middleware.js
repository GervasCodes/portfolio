const env = require('../config/env');
const { ApiResponse, AppError } = require('../utills/responce');

/** 404 handler — runs when no route matched. */
function notFoundHandler(req, _res, next) {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Centralized error handler. Every controller can just `next(err)` or
 * throw inside an asyncHandler-wrapped function, and it lands here.
 */
function errorHandler(err, req, res, _next) {
  let error = err;

  if (!(error instanceof AppError)) {
    // Known driver/library errors get translated into friendlier AppErrors.
    if (error.code === 'ER_DUP_ENTRY') {
      error = AppError.conflict('A record with this value already exists');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      error = new AppError('Database not initialized. Did you run migrations?', 500);
    } else {
      error = new AppError(error.message || 'Internal server error', error.statusCode || 500);
    }
  }

  if (!error.isOperational && !env.isProduction()) {
    console.error(err);
  }

  return ApiResponse.error(res, {
    statusCode: error.statusCode || 500,
    message: error.message,
    errors: error.errors,
  });
}

/** Wraps an async route handler so rejected promises reach errorHandler. */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { notFoundHandler, errorHandler, asyncHandler };
