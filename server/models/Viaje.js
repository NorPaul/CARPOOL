// server/models/Viaje.js
// Modelo Sequelize para la tabla Viajes — columnas reales de carpooldb.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Viaje = sequelize.define('Viaje', {
  IdViaje: {
    type:          DataTypes.BIGINT.UNSIGNED,
    primaryKey:    true,
    autoIncrement: true,
  },
  IdRuta: {
    type:       DataTypes.BIGINT.UNSIGNED,
    allowNull:  false,
  },
  IdConductor: {
    type:       DataTypes.BIGINT.UNSIGNED,
    allowNull:  false,
  },
  IdVehiculo: {
    type:       DataTypes.BIGINT.UNSIGNED,
    allowNull:  false,
  },
  FechaSalida: {
    type:      DataTypes.DATE,
    allowNull: false,
  },
  LlegadaEstimada: {
    type:      DataTypes.DATE,
    allowNull: true,
  },
  AsientosTotales: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },
  AsientosDisponibles: {
    type:      DataTypes.INTEGER,
    allowNull: false,
  },
  PrecioPorPasajero: {
    type:      DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
  Notas: {
    type:      DataTypes.TEXT,
    allowNull: true,
  },
  IdEstado: {
    type:      DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  tableName:  'viajes',
  timestamps: true,
  createdAt: 'FechaPublicacion',
  updatedAt: false,
});

module.exports = Viaje;
