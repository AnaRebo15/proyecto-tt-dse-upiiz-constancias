const express = require('express')
const router = express.Router()
const constanciasController = require('../controllers/constancias.controller')

// Rutas
router.get('/:id', constanciasController.obtenerConstanciaPorId);
router.post('/', constanciasController.crearConstancia);
router.put('/:id', constanciasController.actualizarConstancia);
router.get('/relacion/:id', constanciasController.filtrarEventosPorAsistente);
router.get('/consulta/:id', constanciasController.obtenerEventoAsistentePorId);
router.get('/', constanciasController.obtenerFolio);
router.post('/consulta/', constanciasController.obtenerConstanciaPorEventoAsistente);


module.exports = router;