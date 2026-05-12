const express  = require('express');
const router   = express.Router();
const ctrl     = require('./curriculum.controller');
const { authMiddleware }  = require('../../middleware/auth');
const { validate, z }     = require('../../middleware/validate');

const subjectQuery = { query: z.object({ exam: z.enum(['NEET','JEE']).optional() }) };

// Curriculum is public but enriched when authenticated (optionalAuth pattern)
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return next(); // proceed unauthenticated
  return authMiddleware(req, res, next);
};

router.get('/subjects',          validate(subjectQuery), optionalAuth, ctrl.getSubjects);
router.get('/chapters/:subjectId', optionalAuth, ctrl.getChapters);
router.get('/topics/:chapterId',   optionalAuth, ctrl.getTopics);

module.exports = router;
