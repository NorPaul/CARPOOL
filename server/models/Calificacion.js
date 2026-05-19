const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Calificacion = sequelize.define('Calificacion', {
  IdCalificacion: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  IdViaje: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  IdUsuario: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  IdEmisor: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  Estrellas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 },
  },
  Comentario: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'calificaciones',
  timestamps: true,
  createdAt: 'FechaCreacion',
  updatedAt: false,
});

module.exports = Calificacion;
