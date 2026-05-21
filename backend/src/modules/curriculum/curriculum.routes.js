const express  = require('express');
const router   = express.Router();
const ctrl     = require('./curriculum.controller');
const { authMiddleware }  = require('../../middleware/auth');
const { adminMiddleware } = require('../../middleware/admin');
const { validate, z }     = require('../../middleware/validate');

const subjectQuery = { query: z.object({ exam: z.enum(['NEET','JEE']).optional() }) };

// Curriculum is public but enriched when authenticated (optionalAuth pattern)
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return next(); // proceed unauthenticated
  return authMiddleware(req, res, next);
};

// Public/Student Routes
router.get('/subjects',          validate(subjectQuery), optionalAuth, ctrl.getSubjects);
router.get('/chapters/:subjectId', optionalAuth, ctrl.getChapters);
router.get('/topics/:chapterId',   optionalAuth, ctrl.getTopics);
router.get('/full-hierarchy',     authMiddleware, adminMiddleware, ctrl.getFullHierarchy);

// Student Analytics
router.get('/performance',        authMiddleware, ctrl.getStudentPerformance);
router.get('/weak-topics',        authMiddleware, ctrl.getWeakTopics);

// Admin Routes (CRUD)
router.use(authMiddleware, adminMiddleware);

router.post('/subjects',           ctrl.createSubject);
router.patch('/subjects/:id',      ctrl.updateSubject);
router.delete('/subjects/:id',     ctrl.deleteSubject);

router.post('/chapters',           ctrl.createChapter);
router.patch('/chapters/:id',      ctrl.updateChapter);
router.delete('/chapters/:id',     ctrl.deleteChapter);

router.post('/topics',             ctrl.createTopic);
router.patch('/topics/:id',        ctrl.updateTopic);
router.delete('/topics/:id',       ctrl.deleteTopic);

module.exports = router;
