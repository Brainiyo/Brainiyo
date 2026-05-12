const express  = require('express');
const router   = express.Router();
const ctrl     = require('./analytics.controller');
const { authMiddleware } = require('../../middleware/auth');

router.get('/dashboard',       authMiddleware, ctrl.getDashboard);
router.get('/chapter-heatmap', authMiddleware, ctrl.getChapterHeatmap);

module.exports = router;
