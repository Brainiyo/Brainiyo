const rateLimit = require('express-rate-limit');

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60_000;
const max      = parseInt(process.env.RATE_LIMIT_MAX, 10)        || 100;

/** General API limiter */
const rateLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down.' },
});

/** Strict limiter for auth endpoints */
const authLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth requests. Please wait.' },
});

module.exports = { rateLimiter, authLimiter };
