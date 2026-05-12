const express  = require('express');
const router   = express.Router();
const ctrl     = require('./questions.controller');
const { authMiddleware } = require('../../middleware/auth');
const { validate, z }    = require('../../middleware/validate');

const nextSchema = {
  query: z.object({
    topicId: z.string().optional(),
    mode:    z.enum(['practice', 'revision']).default('practice'),
  }),
};

const attemptSchema = {
  body: z.object({
    questionId:        z.string().uuid(),
    selectedOption:    z.enum(['A', 'B', 'C', 'D']).nullable().default(null),
    timeTakenSeconds:  z.number().int().min(0).max(7200),
  }),
};

router.get('/next',    authMiddleware, validate(nextSchema),    ctrl.getNext);
router.post('/attempt', authMiddleware, validate(attemptSchema), ctrl.submitAttempt);

module.exports = router;
