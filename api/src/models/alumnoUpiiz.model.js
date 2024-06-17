const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Asistente = require('./asistentes.model');

const AlumnoUpiiz = sequelize.define('alumnoUpiiz', {
  boleta: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  programa_academico: {
    type: DataTypes.STRING,
    allowNull: false
  },
  asistente_id_asistente: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false,        // Desactivar los campos createdAt y updatedAt
  tableName: 'alumnoUpiiz', // Especifica el nombre de la tabla
});

AlumnoUpiiz.belongsTo(Asistente, { foreignKey: 'asistente_id_asistente' });

AlumnoUpiiz.sync()
  .then(() => {
    console.log('Tabla alumnoUpiiz creada o ya existente');
  })
  .catch((error) => {
    console.log('Error al crear la tabla alumnoUpiiz:', error);
  });

module.exports = AlumnoUpiiz;
