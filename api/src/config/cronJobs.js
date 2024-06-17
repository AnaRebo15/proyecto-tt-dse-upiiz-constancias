const cron = require('node-cron');
const { eliminarEventos } = require('../controllers/eventos.controller'); // Actualiza el path correctamente

// Programa para ejecutar cada 1 de marzo a la medianoche
cron.schedule('0 0 1 3 *', async () => {
    try {
        await eliminarEventos();
        console.log("Eventos del año anterior eliminados exitosamente");
    } catch (error) {
        console.error("Error al eliminar eventos del año anterior:", error);
    }
});