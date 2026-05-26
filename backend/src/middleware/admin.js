const { AppError } = require('./errorHandler');

const ALLOWED_ADMIN_EMAILS = [
  'brainiyoofficial@gmail.com',
  'shreyanshg2005@gmail.com'
];

/**
 * Restrict access to administrators only.
 * Must be used AFTER authMiddleware.
 */
const adminMiddleware = (req, res, next) => {
  if (
    req.user &&
    req.user.role === 'admin' &&
    req.user.email &&
    ALLOWED_ADMIN_EMAILS.includes(req.user.email.toLowerCase())
  ) {
    return next();
  }
  next(new AppError('Forbidden: Administrative access required', 403));
};

module.exports = { adminMiddleware, ALLOWED_ADMIN_EMAILS };

