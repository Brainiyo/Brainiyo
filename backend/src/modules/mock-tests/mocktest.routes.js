const express  = require('express');
const router   = express.Router();
const ctrl     = require('./mocktest.controller');
const { authMiddleware } = require('../../middleware/auth');
const { planGate }       = require('../../middleware/planGate');
const { validate, z }    = require('../../middleware/validate');

const generateSchema = {
  body: z.object({ examType: z.enum(['NEET', 'JEE']) }),
};

const submitSchema = {
  body: z.object({
    answers: z.array(
      z.object({
        questionId:     z.string().uuid(),
        selectedOption: z.enum(['A', 'B', 'C', 'D']).nullable().default(null),
      })
    ).min(1),
  }),
  params: z.object({ testId: z.string().uuid() }),
};

// Mock tests are a Pro feature
router.post('/generate',          authMiddleware, planGate('pro'), validate(generateSchema), ctrl.generateMockTest);
router.post('/:testId/submit',    authMiddleware, validate(submitSchema),  ctrl.submitMockTest);
router.get('/history',            authMiddleware, ctrl.getHistory);
router.get('/:testId/result',     authMiddleware, ctrl.getResult);

module.exports = router;
