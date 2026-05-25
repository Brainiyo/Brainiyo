const express = require('express');
const router = express.Router();
const ctrl = require('./analytics.controller');
const { authMiddleware } = require('../../middleware/auth');
const { adminMiddleware } = require('../../middleware/admin');

// Student Analytics
router.get('/dashboard',    authMiddleware, ctrl.getDashboard);
router.get('/leaderboard',  authMiddleware, ctrl.getLeaderboard);
router.get('/public-stats', ctrl.getPublicStats);

// Admin Analytics
router.get('/admin/overview', authMiddleware, adminMiddleware, ctrl.getAdminOverview);

module.exports = router;
