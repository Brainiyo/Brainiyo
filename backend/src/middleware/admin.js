const { AppError } = require('./errorHandler');

/**
 * Restrict access to administrators only.
 * Must be used AFTER authMiddleware.
 */
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  next(new AppError('Forbidden: Administrative access required', 403));
};

module.exports = { adminMiddleware };
