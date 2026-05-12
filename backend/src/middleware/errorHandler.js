const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode  = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';

  logger.error('Request error', {
    method:  req.method,
    path:    req.path,
    message: err.message,
    stack:   isDev ? err.stack : undefined,
  });

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors:  err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  // PostgreSQL unique constraint
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Resource already exists' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: err.message });
  }

  // Operational (known) errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // Unknown errors — don't leak internals in production
  return res.status(500).json({
    success: false,
    message: isDev ? err.message : 'Internal server error',
    stack:   isDev ? err.stack  : undefined,
  });
};

module.exports = { AppError, errorHandler };
