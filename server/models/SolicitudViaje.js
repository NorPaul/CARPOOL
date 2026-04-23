const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SolicitudViaje = sequelize.define('SolicitudViaje', {
  IdSolicitud: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  IdViaje: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  IdUsuario: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  AsientosSolicitados: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  IdEstado: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 1, // 1=Pendiente, 2=Aceptada, 3=Rechazada
  },
  FechaRespuesta: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'solicitudesviaje',
  timestamps: true,
  createdAt: 'FechaCreacion',
  updatedAt: false,
});

module.exports = SolicitudViaje;
