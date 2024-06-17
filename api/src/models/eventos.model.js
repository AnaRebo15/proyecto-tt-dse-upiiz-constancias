const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Atributos del evento
const Evento = sequelize.define('evento', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id_evento'
  },
  nombre_evento: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fecha_evento: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  hora_fin: {
    type: DataTypes.TIME,
    allowNull: false
  },
  duracion: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  lugar: {
    type: DataTypes.STRING,
    allowNull: false
  },
  area: {
    type: DataTypes.STRING,
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
  miembroDep_num_empleado: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: false,  // Desactivar los campos createdAt y updatedAt
  tableName: 'evento', // Especifica el nombre de la tabla
});

Evento.sync()
  .then(() => {
    console.log('Tabla evento creada o ya existente');
  })
  .catch((error) => {
    console.log('Error al crear la tabla evento:', error);
  });

module.exports = Evento;