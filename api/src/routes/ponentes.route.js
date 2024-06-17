const express = require('express')
const router = express.Router()
const ponentesController = require('../controllers/ponentes.controller')

// Rutas
router.get('/', ponentesController.obtenerTodosPonentes);
router.get('/:id', ponentesController.obtenerPonentePorId);
router.post('/', ponentesController.crearPonente);
router.put('/:id', ponentesController.actualizarPonente);
router.get('/consulta/:nombre', ponentesController.obtenerPonentePorNombre);


module.exports = router;