const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Atributos del ponente
const Ponente = sequelize.define('ponente', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id_ponente'
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dependencia: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: false,  // Desactivar los campos createdAt y updatedAt
  tableName: 'ponente', // Especifica el nombre de la tabla
});

Ponente.sync()
  .then(() => {
    console.log('Tabla ponente creada o ya existente');
  })
  .catch((error) => {
    console.log('Error al crear la tabla ponente:', error);
  });

module.exports = Ponente;