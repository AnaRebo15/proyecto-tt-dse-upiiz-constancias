const express = require('express')
const router = express.Router()
const eventosController = require('../controllers/eventos.controller')

// Rutas
router.get('/', eventosController.obtenerTodosEventos);
router.get('/:id', eventosController.obtenerEventoPorId);
router.post('/', eventosController.crearEvento);
router.put('/:id', eventosController.actualizarEvento);
router.delete('/:id', eventosController.eliminarEvento);
router.delete('/', eventosController.eliminarEventos);
router.get('/relacion/:id', eventosController.filtrarEventosPorPonente);
router.post('/relacion/', eventosController.crearRelacionPonente);
router.delete('/relacion/:id_evento', eventosController.eliminarRelacionPonente);
router.get('/lista/completados/', eventosController.filtrarEventosPorCompletado);


module.exports = router;