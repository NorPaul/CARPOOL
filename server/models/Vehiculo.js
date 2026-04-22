// server/models/Vehiculo.js
// Modelo Sequelize para la tabla Vehiculos.
//
// Registra los vehículos asociados a cada usuario conductor.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Representa un vehículo registrado por un usuario.
 * @property {number} IDVehiculo - PK auto-increment
 * @property {number} IDUsuario  - FK hacia Usuarios (propietario)
 * @property {string} Marca      - Marca del vehículo
 * @property {string} Modelo     - Modelo del vehículo
 * @property {number} Anio       - Año de fabricación
 * @property {string} Placa      - Número de placa (único)
 * @property {string} Color      - Color del vehículo
 */
const Vehiculo = sequelize.define('Vehiculo', {
  IDVehiculo: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  IDUsuario: {
    type:       DataTypes.INTEGER,
    allowNull:  false,
    references: { model: 'Usuarios', key: 'IDUsuario' },
  },
  Marca: {
    type:      DataTypes.STRING(60),
    allowNull: false,
  },
  Modelo: {
    type:      DataTypes.STRING(60),
    allowNull: false,
  },
  Anio: {
    type:     DataTypes.INTEGER,
    validate: { min: 1990, max: new Date().getFullYear() + 1 },
  },
  Placa: {
    type:      DataTypes.STRING(20),
    allowNull: false,
    unique:    true,
  },
  Color: {
    type: DataTypes.STRING(40),
  },
}, {
  tableName:  'Vehiculos',
  timestamps: true,
});

module.exports = Vehiculo;
