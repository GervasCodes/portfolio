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
  // Capture this BEFORE any translation below — every branch converts
  // unrecognized errors into a plain AppError, and AppError always sets
  // isOperational = true in its constructor. That means checking
  // `error.isOperational` *after* translation can never be false, so
  // logging based on it was effectively dead code. We need to know
  // whether the *original* error was one of our intentional AppErrors.
  const wasIntentional = err instanceof AppError;
  let error = err;

  if (!wasIntentional) {
    // Known driver/library errors get translated into friendlier AppErrors.
    if (error.code === 'ER_DUP_ENTRY') {
      error = AppError.conflict('A record with this value already exists');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      error = new AppError('Database not initialized. Did you run migrations?', 500);
    } else {
      error = new AppError(error.message || 'Internal server error', error.statusCode || 500);
    }
  }

  if (!wasIntentional) {
    // Always log unexpected errors, with their original stack trace, in
    // every environment — otherwise real bugs on the live server are
    // completely silent. Deliberate/expected errors (bad input, 404s,
    // conflicts) are intentionally not logged here to keep signal high.
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
