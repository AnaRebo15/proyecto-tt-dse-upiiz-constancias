const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Asistente = require('./asistentes.model');
const Evento = require('./eventos.model');

// Atributos del constancia
const Constancia = sequelize.define('constancia', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id_constancia'
  },
  folio: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    allowNull: false
  },
  asistente_id_asistente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  evento_id_evento: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false,  // Desactivar los campos createdAt y updatedAt
  tableName: 'constancia', // Especifica el nombre de la tabla
});

Constancia.belongsTo(Asistente, { foreignKey: 'asistente_id_asistente' });
Constancia.belongsTo(Evento, { foreignKey: 'evento_id_evento' });

Constancia.sync()
  .then(() => {
    console.log('Tabla constancia creada o ya existente');
  })
  .catch((error) => {
    console.log('Error al crear la tabla constancia:', error);
  });

module.exports = Constancia;