const express    = require('express');
const router     = express.Router();
const ctrl       = require('./auth.controller');
const { authMiddleware } = require('../../middleware/auth');
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
router.post('/demo-login',   (req, res) => {
  const { signToken } = require('../../utils/jwt');
  const token = signToken({ userId: 'demo-student-id' });
  res.json({ success: true, token, user: { name: 'Demo Student', target_exam: 'NEET' } });
});
router.get('/me',            authMiddleware, ctrl.getMe);
router.patch('/me',          authMiddleware, validate(updateSchema), ctrl.updateMe);

module.exports = router;
