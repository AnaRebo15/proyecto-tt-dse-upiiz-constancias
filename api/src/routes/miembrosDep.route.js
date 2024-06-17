const express = require('express')
const router = express.Router()
const miembrosDepController = require('../controllers/miembrosDep.controller')

// Rutas
router.get('/', miembrosDepController.obtenerTodosMiembrosDep);
router.post('/login/', miembrosDepController.loginMiembroDep);


module.exports = router;