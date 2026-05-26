const { query } = require('../../config/db');
const { AppError } = require('../../middleware/errorHandler');
const { sendAdminInvite } = require('../../utils/email');
const { ALLOWED_ADMIN_EMAILS } = require('../../middleware/admin');

const inviteController = {
  /**
   * POST /api/auth/admin/invite
   * Body: { email, role }
   */
  createInvite: async (req, res, next) => {
    try {
      const { email, role = 'admin' } = req.body;
      const invitedBy = req.user.id;

      // Restrict admin invites to only allowed emails
      if (!ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase())) {
        return next(new AppError('Only authorized admin emails can be invited', 400));
      }

      // 1. Check if user already exists
      const userCheck = await query(`SELECT id FROM users WHERE email = $1`, [email]);
      if (userCheck.rows.length > 0) {
        return next(new AppError('A user with this email already exists', 400));
      }

      // 2. Create invite record
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);

      const result = await query(
        `INSERT INTO admin_invites (email, role, invited_by, expires_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE 
           SET expires_at = EXCLUDED.expires_at, status = 'pending'
         RETURNING id`,
        [email, role, invitedBy, expiresAt]
      );

      const inviteId = result.rows[0].id;
      const inviteLink = `${process.env.ADMIN_URL || 'http://localhost:3001'}/accept-invite?id=${inviteId}`;

      // 3. Send Email
      await sendAdminInvite(email, inviteLink);

      res.status(201).json({ success: true, message: 'Invitation sent' });
    } catch (err) { next(err); }
  },

  /**
   * GET /api/auth/admin/invites
   */
  listInvites: async (req, res, next) => {
    try {
      const { rows } = await query(
        `SELECT i.*, u.name as invited_by_name 
         FROM admin_invites i
         JOIN users u ON u.id = i.invited_by
         ORDER BY i.created_at DESC`
      );
      res.json({ success: true, data: rows });
    } catch (err) { next(err); }
  },

  /**
   * GET /api/auth/admin/invites/:id
   * Public (for the invite acceptance page)
   */
  getInvite: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { rows } = await query(
        `SELECT id, email, role, status, expires_at FROM admin_invites WHERE id = $1`,
        [id]
      );

      const invite = rows[0];
      if (!invite) return next(new AppError('Invite not found', 404));
      if (invite.status !== 'pending' || new Date(invite.expires_at) < new Date()) {
        return next(new AppError('This invitation has expired or been used', 400));
      }

      res.json({ success: true, data: invite });
    } catch (err) { next(err); }
  },

  /**
   * POST /api/auth/admin/accept-invite
   * Body: { inviteId, idToken }
   */
  acceptInvite: async (req, res, next) => {
    const { inviteId, idToken } = req.body;
    const { verifyFirebaseToken } = require('../../config/firebase');
    const { signToken } = require('../../utils/jwt');

    try {
      // 1. Verify Invite
      const inviteRes = await query(`SELECT * FROM admin_invites WHERE id = $1`, [inviteId]);
      const invite = inviteRes.rows[0];
      if (!invite || invite.status !== 'pending') return next(new AppError('Invalid invite', 400));

      if (!ALLOWED_ADMIN_EMAILS.includes(invite.email.toLowerCase())) {
        return next(new AppError('Unauthorized admin email', 403));
      }

      // 2. Verify Firebase Token
      const decoded = await verifyFirebaseToken(idToken);
      if (decoded.email !== invite.email) {
        return next(new AppError('Email mismatch. Please sign in with the invited email.', 400));
      }

      // 3. Create/Promote User
      const result = await query(
        `INSERT INTO users (firebase_uid, name, email, role, is_verified, is_onboarded)
         VALUES ($1, $2, $3, $4, TRUE, TRUE)
         ON CONFLICT (firebase_uid) DO UPDATE 
           SET role = EXCLUDED.role, email = EXCLUDED.email
         RETURNING id, name, email, role`,
        [decoded.uid, decoded.name || 'Admin', decoded.email, invite.role]
      );

      const user = result.rows[0];

      // 4. Mark Invite as Accepted
      await query(
        `UPDATE admin_invites SET status = 'accepted', accepted_at = NOW() WHERE id = $1`,
        [inviteId]
      );

      // 5. Issue JWT
      const token = signToken({ userId: user.id, role: user.role });

      res.json({ success: true, token, user });
    } catch (err) { next(err); }
  }
};

module.exports = inviteController;
