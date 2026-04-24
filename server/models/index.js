const User = require('./User');
const Viaje = require('./Viaje');
const Vehiculo = require('./Vehiculo');
const SolicitudViaje = require('./SolicitudViaje');
const Mensaje = require('./Mensaje');
const Calificacion = require('./Calificacion');
const ParticipanteViaje = require('./ParticipanteViaje');
const Ruta = require('./Ruta');
const Ubicacion = require('./Ubicacion');
const PerfilUsuario = require('./PerfilUsuario');
const InvitadoViaje = require('./InvitadoViaje');

// Relaciones de Usuario
User.hasMany(Vehiculo, { foreignKey: 'IdUsuario', as: 'vehiculos' });
Vehiculo.belongsTo(User, { foreignKey: 'IdUsuario', as: 'usuario' });

User.hasOne(PerfilUsuario, { foreignKey: 'IdUsuario', as: 'perfil' });
PerfilUsuario.belongsTo(User, { foreignKey: 'IdUsuario', as: 'usuario' });

User.hasMany(Viaje, { foreignKey: 'IdConductor', as: 'viajesConductor' });
Viaje.belongsTo(User, { foreignKey: 'IdConductor', as: 'conductor' });

// Relaciones de Viaje
Viaje.belongsTo(Vehiculo, { foreignKey: 'IdVehiculo', as: 'vehiculo' });
Vehiculo.hasMany(Viaje, { foreignKey: 'IdVehiculo', as: 'viajes' });

Viaje.belongsTo(Ruta, { foreignKey: 'IdRuta', as: 'ruta' });
Ruta.hasMany(Viaje, { foreignKey: 'IdRuta', as: 'viajes' });

Ruta.belongsTo(Ubicacion, { foreignKey: 'IdOrigen', as: 'origen' });
Ruta.belongsTo(Ubicacion, { foreignKey: 'IdDestino', as: 'destino' });

// Solicitudes
Viaje.hasMany(SolicitudViaje, { foreignKey: 'IdViaje', as: 'solicitudes' });
SolicitudViaje.belongsTo(Viaje, { foreignKey: 'IdViaje', as: 'viaje' });

User.hasMany(SolicitudViaje, { foreignKey: 'IdUsuario', as: 'solicitudesEnviadas' });
SolicitudViaje.belongsTo(User, { foreignKey: 'IdUsuario', as: 'usuario' });

// Participantes (Pasajeros confirmados)
Viaje.belongsToMany(User, { 
  through: ParticipanteViaje, 
  foreignKey: 'IdViaje', 
  otherKey: 'IdUsuario', 
  as: 'pasajeros' 
});
User.belongsToMany(Viaje, { 
  through: ParticipanteViaje, 
  foreignKey: 'IdUsuario', 
  otherKey: 'IdViaje', 
  as: 'viajesPasajero' 
});

ParticipanteViaje.belongsTo(User, { foreignKey: 'IdUsuario', as: 'usuario' });
ParticipanteViaje.belongsTo(Viaje, { foreignKey: 'IdViaje', as: 'viaje' });
ParticipanteViaje.belongsTo(SolicitudViaje, { foreignKey: 'IdSolicitud', as: 'solicitud' });

// Mensajes (Chat)
Viaje.hasMany(Mensaje, { foreignKey: 'IdViaje', as: 'mensajes' });
Mensaje.belongsTo(Viaje, { foreignKey: 'IdViaje', as: 'viaje' });
Mensaje.belongsTo(User, { foreignKey: 'IdRemitente', as: 'remitente' });

// Calificaciones
User.hasMany(Calificacion, { foreignKey: 'IdUsuario', as: 'calificacionesRecibidas' });
Calificacion.belongsTo(User, { foreignKey: 'IdUsuario', as: 'calificado' });
Calificacion.belongsTo(User, { foreignKey: 'IdEmisor', as: 'emisor' });
Calificacion.belongsTo(Viaje, { foreignKey: 'IdViaje', as: 'viaje' });

// Invitados
Viaje.hasMany(InvitadoViaje, { foreignKey: 'IdViaje', as: 'invitados' });
InvitadoViaje.belongsTo(Viaje, { foreignKey: 'IdViaje', as: 'viaje' });

module.exports = {
  User,
  Viaje,
  Vehiculo,
  SolicitudViaje,
  Mensaje,
  Calificacion,
  ParticipanteViaje,
  Ruta,
  Ubicacion,
  PerfilUsuario,
  InvitadoViaje
};
