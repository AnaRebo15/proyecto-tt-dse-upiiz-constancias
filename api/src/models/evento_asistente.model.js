const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Asistente = require('./asistentes.model');
const Evento = require('./eventos.model');


const EventoAsistente = sequelize.define('evento_asistente', {
  evento_id_evento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  asistente_id_asistente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  hora_entrada: {
    type: DataTypes.DATE,
    allowNull: false
  },
  hora_salida: {
    type: DataTypes.DATE,
    allowNull: false
  },
  constancia: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false,        // Desactivar los campos createdAt y updatedAt
  tableName: 'evento_asistente', // Especifica el nombre de la tabla
  autoIncrement: false
});

EventoAsistente.belongsTo(Asistente, { foreignKey: 'asistente_id_asistente' });
EventoAsistente.belongsTo(Evento, { foreignKey: 'evento_id_evento' });

EventoAsistente.sync()
  .then(() => {
    console.log('Tabla evento_asistente creada o ya existente');
  })
  .catch((error) => {
    console.log('Error al crear la tabla evento_asistente:', error);
  });

module.exports = EventoAsistente;