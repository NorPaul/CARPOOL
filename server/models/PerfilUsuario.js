const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PerfilUsuario = sequelize.define('PerfilUsuario', {
  IdUsuario: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    allowNull: false,
  },
  Bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  AvatarUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  FechaNacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  Texto: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'PerfilesUsuario',
  timestamps: false
});

module.exports = PerfilUsuario;
