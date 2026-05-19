const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, profileController.show);
router.get('/:userId', authMiddleware, profileController.show);
router.put('/', authMiddleware, profileController.update);

module.exports = router;
