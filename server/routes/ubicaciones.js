const express = require('express');
const router = express.Router();
const ubicacionController = require('../controllers/ubicacionController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, ubicacionController.getAll);

module.exports = router;
