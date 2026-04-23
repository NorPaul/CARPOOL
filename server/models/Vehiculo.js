// server/models/Vehiculo.js
// Modelo Sequelize para la tabla Vehiculos — columnas reales de carpooldb.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vehiculo = sequelize.define('Vehiculo', {
  IdVehiculo: {
    type:          DataTypes.BIGINT.UNSIGNED,
    primaryKey:    true,
    autoIncrement: true,
  },
  IdUsuario: {
    type:       DataTypes.BIGINT.UNSIGNED,
    allowNull:  false,
  },
  Modelo: {
    type:      DataTypes.STRING(255),
    allowNull: false,
  },
  Placas: {
    type:      DataTypes.STRING(255),
    allowNull: false,
    unique:    true,
  },
  Color: {
    type:      DataTypes.STRING(255),
    allowNull: false,
  },
  Capacidad: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },
  Activo: {
    type:         DataTypes.BOOLEAN,
    defaultValue: true,
  },
  FotoUrl: {
    type:      DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName:  'vehiculos',
  timestamps: false,
});

module.exports = Vehiculo;
