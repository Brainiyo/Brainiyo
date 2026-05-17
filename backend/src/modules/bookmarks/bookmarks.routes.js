const express = require('express');
const router  = express.Router();
const ctrl    = require('./bookmarks.controller');
const { authMiddleware } = require('../../middleware/auth');

router.post('/', authMiddleware, ctrl.toggleBookmark);
router.get('/',  authMiddleware, ctrl.getBookmarks);

module.exports = router;
