const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculoController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, vehiculoController.getAll);
router.post('/', authMiddleware, vehiculoController.create);
router.put('/:id', authMiddleware, vehiculoController.update);
router.delete('/:id', authMiddleware, vehiculoController.delete);

module.exports = router;
