const { verifyFirebaseToken } = require('../../config/firebase');
const { query }               = require('../../config/db');
const { signToken }           = require('../../utils/jwt');
const { AppError }            = require('../../middleware/errorHandler');

/**
 * POST /api/auth/verify-token
 *
 * Accepts a Firebase ID token from the mobile app, verifies it with Firebase Admin,
 * upserts the user in our PostgreSQL users table, and issues our own short JWT.
 *
 * This is the single auth handshake — after this, clients use our JWT.
 */
const verifyToken = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return next(new AppError('idToken is required', 400));

    // 1. Verify with Firebase
    const decoded = await verifyFirebaseToken(idToken);
    const { uid, email, name, phone_number } = decoded;

    // 2. Upsert user in our DB
    const result = await query(
      `INSERT INTO users (firebase_uid, name, email, phone, target_exam, class, is_verified)
       VALUES ($1, $2, $3, $4, 'NEET', 11, TRUE)
       ON CONFLICT (firebase_uid) DO UPDATE
         SET email      = COALESCE(EXCLUDED.email, users.email),
             last_login = NOW()
       RETURNING id, firebase_uid, name, email, phone, class, target_exam, created_at`,
      [uid, name || 'Student', email || null, phone_number || null]
    );

    const user = result.rows[0];

    // 3. Ensure free subscription exists
    await query(
      `INSERT INTO subscriptions (user_id, plan) VALUES ($1, 'free')
       ON CONFLICT DO NOTHING`,
      [user.id]
    );

    // 4. Issue our JWT
    const token = signToken({ userId: user.id, uid });

    res.status(200).json({ success: true, token, user });
  } catch (err) {
    // Firebase token errors are not AppErrors — surface them clearly
    if (err.code?.startsWith('auth/')) {
      return next(new AppError(`Firebase auth error: ${err.message}`, 401));
    }
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Returns the current user's profile from req.user (set by authMiddleware)
 */
const getMe = (req, res) => {
  res.json({ success: true, data: req.user });
};

/**
 * PATCH /api/auth/me
 * Update name, class, target_exam after onboarding
 */
const updateMe = async (req, res, next) => {
  try {
    const { name, class: studentClass, target_exam } = req.body;

    const result = await query(
      `UPDATE users
       SET name        = COALESCE($1, name),
           class       = COALESCE($2, class),
           target_exam = COALESCE($3, target_exam)
       WHERE id = $4
       RETURNING id, name, email, phone, class, target_exam`,
      [name || null, studentClass || null, target_exam || null, req.user.id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

module.exports = { verifyToken, getMe, updateMe };
