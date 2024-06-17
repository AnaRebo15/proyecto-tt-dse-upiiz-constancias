const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Asistente = require('./asistentes.model');

const Externo = sequelize.define('externo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id_externo'
  },
  dependencia: {
    type: DataTypes.STRING,
    allowNull: false
  },
  asistente_id_asistente: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false,        // Desactivar los campos createdAt y updatedAt
  tableName: 'externo',     // Especifica el nombre de la tabla
});

Externo.belongsTo(Asistente, { foreignKey: 'asistente_id_asistente' });

Externo.sync()
  .then(() => {
    console.log('Tabla externo creada o ya existente');
  })
  .catch((error) => {
    console.log('Error al crear la tabla externo:', error);
  });

module.exports = Externo;