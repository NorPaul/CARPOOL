const { Viaje, Ruta, Ubicacion, SolicitudViaje, User, ParticipanteViaje, Calificacion } = require('../models');
const { Op } = require('sequelize');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalViajesConductor = await Viaje.count({ where: { IdConductor: userId, IdEstado: [1, 2] } });

    // Viajes activos como pasajero
    const user = await User.findByPk(userId, {
      include: [{ model: Viaje, as: 'viajesPasajero', where: { IdEstado: [1, 2] }, required: false }]
    });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
    const totalViajesPasajero = user.viajesPasajero.length;

    // Ganancias (Precio * Pasajeros confirmados)
    const misViajes = await Viaje.findAll({
      where: { IdConductor: userId, IdEstado: 3 }, // Solo terminados
      include: [{ model: User, as: 'pasajeros' }]
    });
    let ganancias = 0;
    misViajes.forEach(v => {
      ganancias += v.PrecioPorPasajero * v.pasajeros.length;
    });

    // Calificación promedio
    const califs = await Calificacion.findAll({ where: { IdUsuario: userId } });
    const promedio = califs.length > 0 ? (califs.reduce((acc, curr) => acc + curr.Estrellas, 0) / califs.length).toFixed(1) : '0.0';

    // Notificaciones: rechazadas o expulsadas/canceladas por conductor (no leídas)
    const notificaciones = await SolicitudViaje.findAll({
      where: { IdUsuario: userId, IdEstado: [3, 5], [Op.or]: [{ Leido: false }, { Leido: null }] },
      include: [{
        model: Viaje, as: 'viaje',
        include: [{ model: Ruta, as: 'ruta', include: [{ model: Ubicacion, as: 'destino' }] }]
      }]
    });

    // Notificaciones: solicitud aceptada (viaje próximo) o viaje finalizado
    const notifAceptadas = await SolicitudViaje.findAll({
      where: { IdUsuario: userId, IdEstado: 2, [Op.or]: [{ Leido: false }, { Leido: null }] },
      include: [{
        model: Viaje, as: 'viaje',
        where: { IdEstado: [1, 3] },
        required: true,
        include: [
          { model: Ruta, as: 'ruta', include: [{ model: Ubicacion, as: 'destino' }] },
          { model: User, as: 'conductor', attributes: ['IdUsuario', 'NombreCompleto'] }
        ]
      }]
    });

    // Viajes en curso como pasajero (IdEstado 2)
    const enCursoPasajero = await user.getViajesPasajero({
      where: { IdEstado: 2 },
      include: [
        { model: User, as: 'conductor', attributes: ['NombreCompleto'] },
        { model: Ruta, as: 'ruta', include: [{ model: Ubicacion, as: 'destino' }] }
      ]
    });

    // Solicitudes pendientes como conductor
    const pendientesCount = await SolicitudViaje.count({
      include: [{ model: Viaje, as: 'viaje', where: { IdConductor: userId } }],
      where: { IdEstado: 1 }
    });

    // Notificaciones para conductor: pasajero canceló su lugar
    const notifCancelaciones = await SolicitudViaje.findAll({
      where: { IdEstado: 4, [Op.or]: [{ LeidoConductor: false }, { LeidoConductor: null }] },
      include: [{
        model: Viaje, as: 'viaje',
        where: { IdConductor: userId, IdEstado: [1, 2] },
        required: true,
        include: [{ model: Ruta, as: 'ruta', include: [{ model: Ubicacion, as: 'destino' }] }]
      }, {
        model: User, as: 'usuario', attributes: ['IdUsuario', 'NombreCompleto']
      }]
    });

    res.json({
      stats: {
        viajesConductor: totalViajesConductor,
        viajesPasajero: totalViajesPasajero,
        ganancias: ganancias,
        reputacion: promedio,
        pendientesCount: pendientesCount
      },
      notificaciones,
      notifAceptadas,
      enCursoPasajero,
      notifCancelaciones
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Error al obtener datos del dashboard' });
  }
};
