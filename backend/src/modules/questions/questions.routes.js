const express  = require('express');
const router   = express.Router();
const ctrl     = require('./questions.controller');
const { authMiddleware } = require('../../middleware/auth');
const { adminMiddleware } = require('../../middleware/admin');
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

// Student Routes
router.get('/next',    authMiddleware, validate(nextSchema),    ctrl.getNext);
router.post('/attempt', authMiddleware, validate(attemptSchema), ctrl.submitAttempt);
router.get('/revision/due', authMiddleware, ctrl.getRevisionDue);

// Admin Routes
router.use(authMiddleware, adminMiddleware);

router.get('/',        ctrl.listQuestions);
router.post('/',       ctrl.createQuestion);
router.post('/bulk',  ctrl.bulkCreateQuestions);
router.patch('/:id',   ctrl.updateQuestion);
router.delete('/:id',  ctrl.deleteQuestion);

module.exports = router;
