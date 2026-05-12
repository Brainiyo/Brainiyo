const { query }    = require('../config/db');
const { AppError } = require('./errorHandler');

/**
 * Middleware factory — blocks free-plan users from accessing pro features.
 * Usage: router.post('/generate', authMiddleware, planGate('pro'), controller.generate)
 *
 * @param {'pro'} requiredPlan
 */
const planGate = (requiredPlan = 'pro') => async (req, res, next) => {
  try {
    const result = await query(
      `SELECT plan, expires_at
       FROM subscriptions
       WHERE user_id = $1 AND is_active = TRUE
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );

    const sub = result.rows[0];
    const plan = sub?.plan || 'free';

    // Check expiry for paid plans
    if (plan === 'pro' && sub.expires_at && new Date(sub.expires_at) < new Date()) {
      // Deactivate expired subscription
      await query(
        `UPDATE subscriptions SET is_active = FALSE WHERE user_id = $1 AND plan = 'pro'`,
        [req.user.id]
      );
      return next(
        new AppError('Your Pro subscription has expired. Please renew to continue.', 403)
      );
    }

    if (requiredPlan === 'pro' && plan !== 'pro') {
      return next(
        new AppError('This feature is available on Brainiyo Pro. Upgrade to unlock.', 403)
      );
    }

    // Attach plan to request for downstream use
    req.subscription = { plan, expires_at: sub?.expires_at };
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { planGate };
