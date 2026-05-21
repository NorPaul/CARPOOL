const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, solicitudController.index);
router.post('/:viajeId', authMiddleware, solicitudController.store);
router.put('/:solicitudId', authMiddleware, solicitudController.update);
router.delete('/:solicitudId/cancelar', authMiddleware, solicitudController.cancelar);
router.post('/:solicitudId/dismiss', authMiddleware, solicitudController.dismiss);
router.post('/:solicitudId/dismiss-conductor', authMiddleware, solicitudController.dismissConductor);

module.exports = router;
