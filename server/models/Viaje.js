// server/models/Viaje.js
// Modelo Sequelize para la tabla Viajes.
//
// Campos principales del schema original (carpooldb_schema_backup.sql):
//   IDViaje, IDConductor, Origen, Destino, FechaHora, Asientos, Estado, Precio

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Representa un viaje ofrecido por un conductor.
 * @property {number}  IDViaje     - PK auto-increment
 * @property {number}  IDConductor - FK hacia Usuarios
 * @property {string}  Origen      - Punto de partida
 * @property {string}  Destino     - Punto de llegada
 * @property {Date}    FechaHora   - Fecha y hora de salida
 * @property {number}  Asientos    - Lugares disponibles
 * @property {string}  Estado      - 'activo' | 'completado' | 'cancelado'
 * @property {number}  Precio      - Costo por pasajero
 */
const Viaje = sequelize.define('Viaje', {
  IDViaje: {
    type:          DataTypes.INTEGER,
    primaryKey:    true,
    autoIncrement: true,
  },
  IDConductor: {
    type:       DataTypes.INTEGER,
    allowNull:  false,
    references: { model: 'Usuarios', key: 'IDUsuario' },
  },
  Origen: {
    type:      DataTypes.STRING(200),
    allowNull: false,
  },
  Destino: {
    type:      DataTypes.STRING(200),
    allowNull: false,
  },
  FechaHora: {
    type:      DataTypes.DATE,
    allowNull: false,
  },
  Asientos: {
    type:         DataTypes.INTEGER,
    allowNull:    false,
    defaultValue: 1,
    validate:     { min: 1, max: 8 },
  },
  Estado: {
    type:         DataTypes.ENUM('activo', 'completado', 'cancelado'),
    defaultValue: 'activo',
  },
  Precio: {
    type:      DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
}, {
  tableName:  'Viajes',
  timestamps: true,
});

module.exports = Viaje;
