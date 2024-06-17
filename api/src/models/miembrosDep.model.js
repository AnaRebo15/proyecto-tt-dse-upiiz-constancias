const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Atributos del miembroDep
const MiembroDep = sequelize.define('miembroDep', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'num_empleado'
  },
  clave: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: false,  // Desactivar los campos createdAt y updatedAt
  tableName: 'miembroDep', // Especifica el nombre de la tabla
});

MiembroDep.sync()
  .then(() => {
    console.log('Tabla miembroDep creada o ya existente');
  })
  .catch((error) => {
    console.log('Error al crear la tabla miembroDep:', error);
  });

module.exports = MiembroDep;