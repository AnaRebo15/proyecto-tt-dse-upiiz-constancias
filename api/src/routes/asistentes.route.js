const express = require('express')
const router = express.Router()
const asistentesController = require('../controllers/asistentes.controller')

// Rutas
router.get('/', asistentesController.obtenerTodosAsistentes);
router.get('/:id', asistentesController.obtenerAsistentePorId);
router.post('/', asistentesController.crearAsistente);
router.put('/:id', asistentesController.actualizarAsistente);
router.get('/dependencias/obtener', asistentesController.obtenerDependencias);
router.post('/login/', asistentesController.loginAsistente);
router.get('/correo/:correo', asistentesController.obtenerAsistentePorCorreo);

module.exports = router;