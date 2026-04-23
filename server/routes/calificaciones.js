const express = require('express');
const router = express.Router();
const calificacionController = require('../controllers/calificacionController');
const authMiddleware = require('../middleware/auth');

router.post('/:viajeId/:evaluadoId', authMiddleware, calificacionController.store);

module.exports = router;
