const { Viaje, User, Ruta, Ubicacion, ParticipanteViaje, SolicitudViaje, Mensaje } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const userId = req.user.id;
    const { estado = 'todos', fecha = 'todos' } = req.query;

    // Build estado filter
    let estadoIds;
    if (estado === 'activos') estadoIds = { [Op.in]: [1, 2] };
    else if (estado === 'finalizados') estadoIds = { [Op.in]: [3] };
    else if (estado === 'cancelados') estadoIds = { [Op.in]: [4] };
    // sin filtro si no coincide

    // Build fecha filter
    let fechaWhere = {};
    const now = new Date();
    if (fecha === 'mes') {
      fechaWhere = { FechaSalida: { [Op.between]: [new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)] } };
    } else if (fecha === 'anio') {
      fechaWhere = { FechaSalida: { [Op.between]: [new Date(now.getFullYear(), 0, 1), new Date(now.getFullYear(), 11, 31, 23, 59, 59)] } };
    }

    const conductorWhere = { IdConductor: userId, ...(estadoIds !== undefined ? { IdEstado: estadoIds } : {}), ...fechaWhere };
    const viajesConductor = await Viaje.findAll({
      where: conductorWhere,
      include: [
        { model: Ruta, as: 'ruta', include: [
          { model: Ubicacion, as: 'origen' },
          { model: Ubicacion, as: 'destino' },
        ]},
        { model: User, as: 'pasajeros', attributes: ['IdUsuario', 'NombreCompleto'] },
      ],
      order: [['IdEstado', 'ASC'], ['FechaSalida', 'DESC']]
    });

    // Viajes donde es pasajero — query directa via ParticipanteViaje para evitar bugs de belongsToMany + where
    const pasajeroWhere = { ...(estadoIds !== undefined ? { IdEstado: estadoIds } : {}), ...fechaWhere };
    const participaciones = await ParticipanteViaje.findAll({
      where: { IdUsuario: userId },
      attributes: ['IdViaje', 'IdSolicitud'],
    });
    const viajeIdsPasajero = participaciones.map(p => p.IdViaje);
    const solicitudByViaje = {};
    participaciones.forEach(p => { solicitudByViaje[p.IdViaje] = p.IdSolicitud; });

    let viajesPasajero = [];
    if (viajeIdsPasajero.length > 0) {
      const viajeWhere = { IdViaje: viajeIdsPasajero, ...pasajeroWhere };
      const viajes = await Viaje.findAll({
        where: viajeWhere,
        include: [
          { model: User, as: 'conductor', attributes: ['IdUsuario', 'NombreCompleto', 'Telefono'] },
          { model: Ruta, as: 'ruta', include: [
            { model: Ubicacion, as: 'origen' },
            { model: Ubicacion, as: 'destino' },
          ]}
        ],
        order: [['IdEstado', 'ASC'], ['FechaSalida', 'DESC']],
      });
      // Attach IdSolicitud to each viaje for cancel button
      viajesPasajero = viajes.map(v => ({
        ...v.toJSON(),
        ParticipanteViaje: { IdSolicitud: solicitudByViaje[v.IdViaje] ?? null },
      }));
    }

    // Último mensaje por viaje para indicador de no leídos
    const todosLosViajeIds = [
      ...viajesConductor.map(v => v.IdViaje),
      ...viajesPasajero.map(v => v.IdViaje),
    ];
    const ultimosMensajes = {};
    if (todosLosViajeIds.length > 0) {
      const msgs = await Mensaje.findAll({
        attributes: ['IdViaje', 'IdRemitente', 'FechaEnvio'],
        where: { IdViaje: todosLosViajeIds },
        order: [['FechaEnvio', 'DESC']],
      });
      // Keep only the latest per viaje
      for (const m of msgs) {
        if (!ultimosMensajes[m.IdViaje]) ultimosMensajes[m.IdViaje] = m;
      }
    }

    // Avisos: solicitudes rechazadas (3) o expulsadas (5) del usuario
    const avisos = await SolicitudViaje.findAll({
      where: { IdUsuario: userId, IdEstado: [3, 5] },
      include: [{
        model: Viaje, as: 'viaje',
        include: [{ model: Ruta, as: 'ruta', include: [
          { model: Ubicacion, as: 'origen' },
          { model: Ubicacion, as: 'destino' },
        ]}]
      }],
      order: [['FechaCreacion', 'DESC']],
    });

    res.json({
      conductor: viajesConductor,
      pasajero: viajesPasajero,
      avisos,
      ultimosMensajes,
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

    // Si se filtra por fecha, combinar: en esa fecha Y en el futuro
    if (fecha) {
      const startOfDay = new Date(fecha);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(fecha);
      endOfDay.setHours(23, 59, 59, 999);
      const now = new Date();
      
      // Tomar el máximo entre inicio del día y ahora, mínimo entre fin del día y futuro lejano
      const effectiveStart = startOfDay > now ? startOfDay : now;
      whereClause.FechaSalida = { [Op.between]: [effectiveStart, endOfDay] };
    }

    // Construir filtro de ruta solo si hay filtros
    const rutaInclude = {
      model: Ruta, as: 'ruta',
      include: [
        { model: Ubicacion, as: 'origen' },
        { model: Ubicacion, as: 'destino' },
      ]
    };
    
    // Agregar where a ruta solo si hay filtros
    if (IdOrigen || IdDestino) {
      rutaInclude.where = {};
      if (IdOrigen) rutaInclude.where.IdOrigen = IdOrigen;
      if (IdDestino) rutaInclude.where.IdDestino = IdDestino;
    }

    const viajes = await Viaje.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'conductor', attributes: ['NombreCompleto', 'Correo', 'Telefono'] },
        rutaInclude,
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

exports.ganancias = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fecha } = req.query; // formato YYYY-MM

    let whereClause = { IdConductor: userId, IdEstado: 3 };

    if (fecha) {
      if (fecha.includes('-')) {
        const [anio, mes] = fecha.split('-');
        whereClause.FechaSalida = { [Op.between]: [new Date(anio, mes - 1, 1), new Date(anio, mes, 0, 23, 59, 59)] };
      } else {
        const anio = parseInt(fecha);
        whereClause.FechaSalida = { [Op.between]: [new Date(anio, 0, 1), new Date(anio, 11, 31, 23, 59, 59)] };
      }
    }

    const viajes = await Viaje.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'pasajeros', attributes: ['IdUsuario'] },
        { model: Ruta, as: 'ruta', include: [
          { model: Ubicacion, as: 'origen' },
          { model: Ubicacion, as: 'destino' },
        ]},
      ],
      order: [['FechaSalida', 'DESC']],
    });

    const viajesConIngreso = viajes.filter(v => v.pasajeros.length > 0);

    const total = viajesConIngreso.reduce((sum, v) => {
      return sum + v.pasajeros.length * Number(v.PrecioPorPasajero);
    }, 0);

    res.json({ total, viajes: viajesConIngreso });
  } catch (error) {
    console.error('Error fetching ganancias:', error);
    res.status(500).json({ message: 'Error al obtener ganancias' });
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
