const { verifyToken } = require('../utils/jwt');
const { query }       = require('../config/db');
const { AppError }    = require('./errorHandler');

/**
 * Verify our own JWT (issued after Firebase verification in POST /auth/verify-token).
 * Attaches req.user = { id, firebase_uid, name, phone, email, class, target_exam }
 */
const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return next(new AppError('Authorization token required', 401));
    }

    const decoded = verifyToken(header.split(' ')[1]);

    const result = await query(
      `SELECT id, firebase_uid, name, phone, email, class, target_exam, is_onboarded, role, xp_points
       FROM users WHERE id = $1`,
      [decoded.userId]
    );

    if (!result.rows.length) return next(new AppError('User not found', 401));

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')  return next(new AppError('Token expired', 401));
    if (err.name === 'JsonWebTokenError') return next(new AppError('Invalid token', 401));
    next(err);
  }
};

module.exports = { authMiddleware };
