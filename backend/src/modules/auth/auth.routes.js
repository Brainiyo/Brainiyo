const express    = require('express');
const router     = express.Router();
const ctrl       = require('./auth.controller');
const inviteCtrl = require('./invite.controller');
const { authMiddleware } = require('../../middleware/auth');
const { adminMiddleware } = require('../../middleware/admin');
const { authLimiter }    = require('../../middleware/rateLimit');
const { validate, z }    = require('../../middleware/validate');

const verifySchema = { body: z.object({ idToken: z.string().min(1) }) };

const updateSchema = {
  body: z.object({
    name:        z.string().min(2).max(100).optional(),
    class:       z.union([z.literal(11), z.literal(12)]).optional(),
    target_exam: z.enum(['NEET', 'JEE']).optional(),
  }),
};

router.post('/verify-token', authLimiter, validate(verifySchema), ctrl.verifyToken);

router.get('/me',            authMiddleware, ctrl.getMe);
router.patch('/me',          authMiddleware, validate(updateSchema), ctrl.updateMe);

// Admin
router.get('/admin/users',       authMiddleware, adminMiddleware, ctrl.listUsers);
router.post('/admin/invite',      authMiddleware, adminMiddleware, inviteCtrl.createInvite);
router.get('/admin/invites',     authMiddleware, adminMiddleware, inviteCtrl.listInvites);
router.get('/admin/invites/:id', inviteCtrl.getInvite); // Public check
router.post('/admin/accept-invite', inviteCtrl.acceptInvite); // Public acceptance

module.exports = router;
