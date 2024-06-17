const express = require('express');
const cors = require('cors');
const routesEventos = require("./src/routes/eventos.route")
const routesAsistentes = require("./src/routes/asistentes.route")
const routesMiembrosDep = require("./src/routes/miembrosDep.route")
const routesPonentes = require("./src/routes/ponentes.route")
const routesConstancias = require("./src/routes/constancias.route")
const routesQrCode = require("./src/routes/qrCode.route")

const cronJobs = require('./src/config/cronJobs'); // Importa el archivo cronJobs

const app = express();
const puerto = process.env.PORT || 3000;

app.use(cors());

// Configuración del servidor
app.use(express.json());
app.use('/tt/v1/eventos', routesEventos);
app.use('/tt/v1/asistentes', routesAsistentes);
app.use('/tt/v1/miembrosDep', routesMiembrosDep);
app.use('/tt/v1/ponentes', routesPonentes);
app.use('/tt/v1/constancias', routesConstancias);
app.use('/tt/v1/qrCode', routesQrCode);

// Ejecutar el servidor
app.listen(puerto, () => {
    console.log("Servidor escuchando en el puerto:", puerto);
});
