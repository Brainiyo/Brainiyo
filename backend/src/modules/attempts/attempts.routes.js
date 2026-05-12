const express = require('express');
const router = express.Router();
const controller = require('./attempts.controller');
const { authenticate } = require('../../middleware/auth');

router.post('/',        authenticate, controller.recordAttempt);
router.get('/history',  authenticate, controller.getHistory);

module.exports = router;
