const express = require('express');
const router = express.Router();
const viajeController = require('../controllers/viajeController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, viajeController.getAll);
router.get('/ganancias', authMiddleware, viajeController.ganancias);
router.get('/search', authMiddleware, viajeController.search);
router.post('/', authMiddleware, viajeController.create);
router.put('/:id/iniciar', authMiddleware, viajeController.iniciar);
router.put('/:id/finalizar', authMiddleware, viajeController.finalizar);
router.put('/:id/cancelar', authMiddleware, viajeController.cancelar);

module.exports = router;
