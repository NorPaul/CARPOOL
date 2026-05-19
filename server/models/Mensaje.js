const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mensaje = sequelize.define('Mensaje', {
  IdMensaje: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  IdViaje: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  IdRemitente: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  Contenido: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'mensajes',
  timestamps: true,
  createdAt: 'FechaEnvio',
  updatedAt: false,
});

module.exports = Mensaje;
