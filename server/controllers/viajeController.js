const { Viaje, User, Ruta, Ubicacion, ParticipanteViaje, SolicitudViaje } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Viajes donde es conductor
    const viajesConductor = await Viaje.findAll({
      where: { IdConductor: userId },
      include: [
        { model: Ruta, as: 'ruta', include: [
          { model: Ubicacion, as: 'origen' },
          { model: Ubicacion, as: 'destino' },
        ]},
        { model: User, as: 'pasajeros', attributes: ['IdUsuario', 'NombreCompleto'] }
      ],
      order: [['IdEstado', 'ASC'], ['FechaSalida', 'ASC']]
    });

    // Viajes donde es pasajero
    const user = await User.findByPk(userId, {
      include: [{
        model: Viaje, as: 'viajesPasajero',
        through: { attributes: ['IdSolicitud'] }, // Traer IdSolicitud de la tabla intermedia
        include: [
          { model: User, as: 'conductor', attributes: ['IdUsuario', 'NombreCompleto', 'Telefono'] },
          { model: Ruta, as: 'ruta', include: [
            { model: Ubicacion, as: 'origen' },
            { model: Ubicacion, as: 'destino' },
          ]}
        ]
      }]
    });

    res.json({
      conductor: viajesConductor,
      pasajero: user.viajesPasajero
    });
  } catch (error) {
    console.error('Error fetching viajes:', error);
    res.status(500).json({ message: 'Error al obtener viajes' });
  }
};

exports.search = async (req, res) => {
  try {
    const { fecha, IdOrigen, IdDestino } = req.query;
    const userId = req.user.id;

    let whereClause = {
      AsientosDisponibles: { [Op.gt]: 0 },
      IdEstado: 1, // Publicado
      IdConductor: { [Op.ne]: userId }, // No mostrar propios viajes
      FechaSalida: { [Op.gt]: new Date() }, // Solo futuros
    };

    if (fecha) {
      const startOfDay = new Date(fecha);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(fecha);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.FechaSalida = { [Op.between]: [startOfDay, endOfDay] };
    }

    let rutaWhere = {};
    if (IdOrigen) rutaWhere.IdOrigen = IdOrigen;
    if (IdDestino) rutaWhere.IdDestino = IdDestino;

    const viajes = await Viaje.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'conductor', attributes: ['NombreCompleto', 'Correo', 'Telefono'] },
        {
          model: Ruta, as: 'ruta',
          where: Object.keys(rutaWhere).length > 0 ? rutaWhere : undefined,
          include: [
            { model: Ubicacion, as: 'origen' },
            { model: Ubicacion, as: 'destino' },
          ]
        },
      ],
      order: [['FechaSalida', 'ASC']]
    });

    res.json(viajes);
  } catch (error) {
    console.error('Error searching viajes:', error);
    res.status(500).json({ message: 'Error al buscar viajes' });
  }
};

exports.create = async (req, res) => {
  try {
    const { IdOrigen, IdDestino, fechaHora, IdVehiculo, asientos, precio, notas } = req.body;
    const userId = req.user.id;
    const fechaSalida = fechaHora;

    // Overlap Check (±1 hour)
    const bufferTime = 60 * 60 * 1000; // 1 hora en ms
    const fechaInicio = new Date(new Date(fechaSalida).getTime() - bufferTime);
    const fechaFin = new Date(new Date(fechaSalida).getTime() + bufferTime);

    // 1. Verificar si ya es CONDUCTOR de otro viaje en ese horario
    const viajeExistente = await Viaje.findOne({
      where: {
        IdConductor: userId,
        IdEstado: [1, 2],
        FechaSalida: { [Op.between]: [fechaInicio, fechaFin] }
      }
    });

    if (viajeExistente) {
      return res.status(400).json({ message: 'Ya tienes un viaje programado (como conductor) cerca de esa hora.' });
    }

    // 2. Verificar si es PASAJERO confirmado de otro viaje en ese horario
    const esPasajero = await ParticipanteViaje.findOne({
      include: [{
        model: Viaje,
        as: 'viaje',
        where: {
          IdEstado: [1, 2],
          FechaSalida: { [Op.between]: [fechaInicio, fechaFin] }
        }
      }],
      where: { IdUsuario: userId }
    });

    if (esPasajero) {
      return res.status(400).json({ message: 'Ya tienes un lugar confirmado en otro viaje cerca de esa hora.' });
    }

    let [ruta] = await Ruta.findOrCreate({
      where: { IdOrigen, IdDestino },
      defaults: { IdOrigen, IdDestino },
    });

    const nuevoViaje = await Viaje.create({
      IdRuta: ruta.IdRuta,
      IdConductor: userId,
      IdVehiculo: IdVehiculo,
      FechaSalida: fechaHora,
      AsientosTotales: asientos,
      AsientosDisponibles: asientos,
      PrecioPorPasajero: precio,
      Notas: notas || null,
      IdEstado: 1, // Publicado
    });

    res.status(201).json(nuevoViaje);
  } catch (error) {
    console.error('Error creating viaje:', error);
    res.status(500).json({ message: 'Error al crear viaje' });
  }
};

exports.iniciar = async (req, res) => {
  try {
    const viaje = await Viaje.findByPk(req.params.id);
    if (!viaje) return res.status(404).json({ message: 'Viaje no encontrado' });
    if (viaje.IdConductor !== req.user.id) return res.status(403).json({ message: 'No autorizado' });

    const pasajerosCount = await ParticipanteViaje.count({ where: { IdViaje: viaje.IdViaje } });
    if (pasajerosCount < 1) {
      return res.status(400).json({ message: 'No puedes iniciar un viaje sin pasajeros.' });
    }

    await viaje.update({ IdEstado: 2 }); // En Curso
    res.json({ message: '¡Viaje iniciado!' });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar viaje' });
  }
};

exports.finalizar = async (req, res) => {
  try {
    const { observaciones } = req.body;
    const viaje = await Viaje.findByPk(req.params.id);
    if (!viaje) return res.status(404).json({ message: 'Viaje no encontrado' });
    if (viaje.IdConductor !== req.user.id) return res.status(403).json({ message: 'No autorizado' });

    await viaje.update({ 
      IdEstado: 3, // Finalizado
      ObservacionesFinales: observaciones 
    });
    res.json({ message: 'Viaje finalizado.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al finalizar viaje' });
  }
};

exports.cancelar = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const viaje = await Viaje.findByPk(id);
    if (!viaje) return res.status(404).json({ message: 'Viaje no encontrado' });
    if (viaje.IdConductor !== userId) return res.status(403).json({ message: 'No autorizado' });
    
    if (viaje.IdEstado === 4) {
      return res.status(400).json({ message: 'Este viaje ya ha sido cancelado previamente.' });
    }
    
    if (viaje.IdEstado === 3) {
      return res.status(400).json({ message: 'No se puede cancelar un viaje que ya ha finalizado.' });
    }

    // Usar una transacción o asegurar el orden
    await SolicitudViaje.update(
      { IdEstado: 5, FechaRespuesta: new Date() },
      { where: { IdViaje: id, IdEstado: [1, 2] } }
    );

    await viaje.update({ IdEstado: 4 });

    res.json({ message: 'El viaje ha sido cancelado y los pasajeros han sido notificados.' });
  } catch (error) {
    console.error('Error al cancelar viaje:', error);
    res.status(500).json({ message: 'Error interno al cancelar el viaje.' });
  }
};
