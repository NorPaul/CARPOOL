const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InvitadoViaje = sequelize.define('InvitadoViaje', {
  IdInvitado: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  IdViaje: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  Correo: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'InvitadosViaje',
  timestamps: false
});

module.exports = InvitadoViaje;
