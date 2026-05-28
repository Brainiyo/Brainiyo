const express = require('express');
const router = express.Router();
const ctrl = require('./mock-tests.controller');
const { authMiddleware } = require('../../middleware/auth');
const { adminMiddleware } = require('../../middleware/admin');

// Student Routes
router.get('/available', authMiddleware, ctrl.listAvailableTemplates);
router.get('/upcoming',  authMiddleware, ctrl.listUpcomingTemplates);
router.post('/start/:templateId', authMiddleware, ctrl.startMockTest);
router.post('/submit/:attemptId', authMiddleware, ctrl.submitMockTest);

// Admin Routes
router.use(authMiddleware, adminMiddleware);
router.post('/admin/templates', ctrl.createTemplate);
router.get('/admin/templates', ctrl.listTemplatesAdmin);
router.get('/admin/templates/:id', ctrl.getTemplateDetails);
router.post('/admin/templates/:id/questions', ctrl.addQuestionsToTemplate);
router.post('/admin/templates/:id/questions/bulk', ctrl.bulkCreateQuestionsForTemplate);
router.delete('/admin/templates/:id/questions/:questionId', ctrl.removeQuestionFromTemplate);
router.delete('/admin/templates/:id/questions', ctrl.removeAllQuestionsFromTemplate);
router.patch('/admin/templates/:id/publish', ctrl.publishTemplate);
router.patch('/admin/templates/:id/unpublish', ctrl.unpublishTemplate);
router.patch('/admin/templates/:id/schedule', ctrl.updateTemplateSchedule);
router.delete('/admin/templates/:id', ctrl.deleteTemplate);

module.exports = router;
