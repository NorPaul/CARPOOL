// server/models/index.js
// Punto de inicialización de Sequelize: importa todos los modelos,
// establece las asociaciones y exporta la instancia y los modelos.
//
// Uso:
//   const { sequelize, User, Viaje } = require('./models');

const sequelize = require('../config/database');

const User     = require('./User');
const Viaje    = require('./Viaje');
const Vehiculo = require('./Vehiculo');

// ─── Asociaciones ─────────────────────────────
// Un usuario puede tener muchos viajes como conductor
User.hasMany(Viaje, { foreignKey: 'IDConductor', as: 'viajesComoDto' });
Viaje.belongsTo(User, { foreignKey: 'IDConductor', as: 'conductor' });

// Un usuario puede tener muchos vehículos
User.hasMany(Vehiculo, { foreignKey: 'IDUsuario', as: 'vehiculos' });
Vehiculo.belongsTo(User, { foreignKey: 'IDUsuario', as: 'propietario' });

module.exports = {
  sequelize,
  User,
  Viaje,
  Vehiculo,
};
