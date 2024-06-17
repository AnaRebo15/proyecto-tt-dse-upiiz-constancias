const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Asistente = require('./asistentes.model');

const AlumnoCecyt = sequelize.define('alumnoCecyt', {
  boleta: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  asistente_id_asistente: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false,        // Desactivar los campos createdAt y updatedAt
  tableName: 'alumnoCecyt', // Especifica el nombre de la tabla
});

AlumnoCecyt.belongsTo(Asistente, { foreignKey: 'asistente_id_asistente' });

AlumnoCecyt.sync()
  .then(() => {
    console.log('Tabla alumnoCecyt creada o ya existente');
  })
  .catch((error) => {
    console.log('Error al crear la tabla alumnoCecyt:', error);
  });

module.exports = AlumnoCecyt;
