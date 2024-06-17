//Establecer la conexión con un dialecto = MySQL
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('tt_bd_constancias', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    timezone: '-06:00', // Configuración de la zona horaria
});

//Probar la conexión
try {
    sequelize.authenticate();
    console.log('Conexión exitosa a la base de datos');
} catch (error) {
    console.error('No se pudo establecer la conexión con la base de datos:', error);
}

module.exports = sequelize;