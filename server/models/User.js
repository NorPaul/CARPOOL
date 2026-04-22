// server/models/User.js
// Modelo Sequelize para la tabla Usuarios.
//
// Campos:
//   - IDUsuario (PK, auto-increment)
//   - NombreCompleto (string, requerido)
//   - Correo (string, único, requerido)
//   - Telefono (string, opcional)
//   - Contrasena (string, hash bcrypt, requerido)
//   - timestamps: createdAt / updatedAt

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Definición del modelo User.
 * La contraseña nunca se devuelve en queries con defaultScope.
 */
const User = sequelize.define('Usuario', {
  IDUsuario: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  NombreCompleto: {
    type:      DataTypes.STRING(100),
    allowNull: false,
  },
  Correo: {
    type:      DataTypes.STRING(150),
    allowNull: false,
    unique:    true,
    validate:  { isEmail: true },
  },
  Telefono: {
    type:      DataTypes.STRING(20),
    allowNull: true,
  },
  Contrasena: {
    type:      DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName:  'Usuarios',
  timestamps: true,
  defaultScope: {
    // Excluye la contraseña de todas las consultas por defecto
    attributes: { exclude: ['Contrasena'] },
  },
  scopes: {
    // Scope especial para autenticación (incluye Contrasena)
    withPassword: { attributes: {} },
  },
});

module.exports = User;
