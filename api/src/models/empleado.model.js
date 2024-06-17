const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Asistente = require('./asistentes.model');


const Empleado = sequelize.define('empleado', {
  numero_empleado: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  cargo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  asistente_id_asistente: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false,        // Desactivar los campos createdAt y updatedAt
  tableName: 'empleado',    // Especifica el nombre de la tabla
}); 

Empleado.belongsTo(Asistente, { foreignKey: 'asistente_id_asistente' });

Empleado.sync()
  .then(() => {
    console.log('Tabla empleado creada o ya existente');
  })
  .catch((error) => {
    console.log('Error al crear la tabla empleado:', error);
  });

module.exports = Empleado;
