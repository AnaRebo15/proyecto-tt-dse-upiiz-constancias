const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Atributos del asistente
const Asistente = sequelize.define('asistente', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id_asistente'
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contrasena: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombre_completo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  edad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sexo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  codigo_qr: {
    type: DataTypes.BLOB,
    allowNull: false
  }
}, {
  timestamps: false,  // Desactivar los campos createdAt y updatedAt
  tableName: 'asistente', // Especifica el nombre de la tabla
});

Asistente.sync()
  .then(() => {
    console.log('Tabla asistente creada o ya existente');
  })
  .catch((error) => {
    console.log('Error al crear la tabla asistente:', error);
  });

module.exports = Asistente;