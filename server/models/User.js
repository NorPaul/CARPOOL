// server/models/User.js
// Modelo Sequelize para la tabla Usuarios.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('Usuario', {
  IdUsuario: {
    type:          DataTypes.BIGINT.UNSIGNED,
    primaryKey:    true,
    autoIncrement: true,
  },
  NombreCompleto: {
    type:      DataTypes.STRING(150),
    allowNull: false,
  },
  Correo: {
    type:      DataTypes.STRING(120),
    allowNull: false,
    unique:    true,
    validate:  { isEmail: true },
  },
  Telefono: {
    type:      DataTypes.STRING(20),
    allowNull: true,
  },
  Contrasena: {
    type:      DataTypes.STRING(150),
    allowNull: false,
  },
  Activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName:  'usuarios',
  timestamps: true,
  createdAt: 'FechaCreacion',
  updatedAt: 'FechaActualizacion',
  defaultScope: {
    attributes: { exclude: ['Contrasena'] },
  },
  scopes: {
    withPassword: { attributes: {} },
  },
});

module.exports = User;
