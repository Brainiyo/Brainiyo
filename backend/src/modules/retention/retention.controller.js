const express = require('express');
const router = express.Router();
const { getUserNotifications, markAsRead } = require('./notification.service');
const { getStreakStatus, useStreakFreeze } = require('./streak.service');
const { authMiddleware } = require('../../middleware/auth');

/**
 * @route GET /api/notifications
 * @desc Get user's in-app notifications
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.user.id);
    res.json(notifications);
  } catch {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * @route POST /api/notifications/:id/read
 * @desc Mark notification as read
 */
router.post('/:id/read', authMiddleware, async (req, res) => {
  try {
    await markAsRead(req.user.id, req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

/**
 * @route GET /api/me/streak
 * @desc Get user's current streak and freeze status
 */
router.get('/streak', authMiddleware, async (req, res) => {
  try {
    const status = await getStreakStatus(req.user.id);
    res.json(status);
  } catch {
    res.status(500).json({ error: 'Failed to fetch streak status' });
  }
});

/**
 * @route POST /api/me/streak/freeze
 * @desc Use a streak freeze (Pro feature)
 */
router.post('/streak/freeze', authMiddleware, async (req, res) => {
  try {
    const success = await useStreakFreeze(req.user.id);
    if (!success) {
      return res.status(400).json({ error: 'No streak freezes available or logic failed' });
    }
    res.json({ success: true, message: 'Streak freeze applied' });
  } catch {
    res.status(500).json({ error: 'Failed to apply streak freeze' });
  }
});

module.exports = router;
