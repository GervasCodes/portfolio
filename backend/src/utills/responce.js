/**
 * ApiResponse — a single, consistent shape for every API reply.
 * Using a class (instead of ad-hoc objects in every controller)
 * keeps response formatting DRY and easy to change in one place.
 */
class ApiResponse {
  constructor(success, statusCode, message, data = null, meta = null) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null) this.data = data;
    if (meta !== null) this.meta = meta;
  }

  send(res) {
    return res.status(this.statusCode).json(this);
  }

  static success(res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) {
    return new ApiResponse(true, statusCode, message, data, meta).send(res);
  }

  static created(res, { message = 'Created', data = null } = {}) {
    return new ApiResponse(true, 201, message, data).send(res);
  }

  static error(res, { statusCode = 500, message = 'Something went wrong', errors = null } = {}) {
    return new ApiResponse(false, statusCode, message, errors ? { errors } : null).send(res);
  }
}

/**
 * AppError — operational errors thrown intentionally from controllers/
 * services (bad input, not found, unauthorized, etc). Caught by the
 * global error middleware and translated into an ApiResponse.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', errors = null) {
    return new AppError(message, 400, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404);
  }

  static conflict(message = 'Conflict') {
    return new AppError(message, 409);
  }
}

module.exports = { ApiResponse, AppError };
