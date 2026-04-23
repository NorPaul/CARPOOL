const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ubicacion = sequelize.define('Ubicacion', {
  IdUbicacion: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  Nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  Direccion: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  Ciudad: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'ubicaciones',
  timestamps: false,
});

module.exports = Ubicacion;
