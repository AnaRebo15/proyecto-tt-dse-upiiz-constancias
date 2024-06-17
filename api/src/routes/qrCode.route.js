const express = require('express')
const router = express.Router()
const qrCodeController = require('../controllers/qrCode.controller')

// Rutas
router.get('/:id', qrCodeController.filtrarAsistentesPorEvento);
router.put('/', qrCodeController.registrarSalida);
router.post('/', qrCodeController.registrarEntrada);
router.post('/relacion/', qrCodeController.obtenerRegistroAsistencia);


module.exports = router;