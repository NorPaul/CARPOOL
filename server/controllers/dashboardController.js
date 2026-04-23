const { Viaje, Ruta, Ubicacion, SolicitudViaje, User, ParticipanteViaje, Calificacion } = require('../models');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalViajesConductor = await Viaje.count({ where: { IdConductor: userId } });
    
    // Viajes como pasajero
    const user = await User.findByPk(userId, {
      include: [{ model: Viaje, as: 'viajesPasajero' }]
    });
    const totalViajesPasajero = user ? user.viajesPasajero.length : 0;

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
    const califs = await Calificacion.findAll({ where: { IdCalificado: userId } });
    const promedio = califs.length > 0 ? (califs.reduce((acc, curr) => acc + curr.Estrellas, 0) / califs.length).toFixed(1) : '0.0';

    // Notificaciones: Solicitudes rechazadas o expulsado (IdEstado 3 o 5)
    const notificaciones = await SolicitudViaje.findAll({
      where: { IdUsuario: userId, IdEstado: [3, 5] },
      include: [{
        model: Viaje, as: 'viaje',
        include: [{ model: Ruta, as: 'ruta', include: [{ model: Ubicacion, as: 'destino' }] }]
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

    res.json({
      stats: {
        viajesConductor: totalViajesConductor,
        viajesPasajero: totalViajesPasajero,
        ganancias: ganancias,
        reputacion: promedio,
        pendientesCount: pendientesCount
      },
      notificaciones,
      enCursoPasajero
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Error al obtener datos del dashboard' });
  }
};
