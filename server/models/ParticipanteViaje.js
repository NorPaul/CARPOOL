const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ParticipanteViaje = sequelize.define('ParticipanteViaje', {
  IdViaje: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
  },
  IdUsuario: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
  },
  IdSolicitud: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
  },
  FechaSalida: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'participantesviaje',
  timestamps: false,
});

module.exports = ParticipanteViaje;
