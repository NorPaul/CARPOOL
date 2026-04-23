const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ruta = sequelize.define('Ruta', {
  IdRuta: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  IdOrigen: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  IdDestino: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  DistanciaKm: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
  DuracionEstimada: {
    type: DataTypes.TIME,
    allowNull: true,
  },
}, {
  tableName: 'rutas',
  timestamps: false,
});

module.exports = Ruta;
