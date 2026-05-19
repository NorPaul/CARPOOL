const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

router.get('/:viajeId', authMiddleware, chatController.show);
router.post('/:viajeId', authMiddleware, chatController.store);

module.exports = router;
