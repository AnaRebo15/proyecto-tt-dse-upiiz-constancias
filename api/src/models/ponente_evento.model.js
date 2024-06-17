const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Ponente = require('./ponentes.model');
const Evento = require('./eventos.model');


const PonenteEvento = sequelize.define('ponente_evento', {
  ponente_id_ponente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  evento_id_evento: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false,        // Desactivar los campos createdAt y updatedAt
  tableName: 'ponente_evento', // Especifica el nombre de la tabla
  autoIncrement: false
});

PonenteEvento.belongsTo(Ponente, { foreignKey: 'ponente_id_ponente' });
PonenteEvento.belongsTo(Evento, { foreignKey: 'evento_id_evento' });

PonenteEvento.sync()
  .then(() => {
    console.log('Tabla ponente_evento creada o ya existente');
  })
  .catch((error) => {
    console.log('Error al crear la tabla ponente_evento:', error);
  });

module.exports = PonenteEvento;
