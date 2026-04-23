const { Viaje, User, Ruta, Ubicacion, ParticipanteViaje } = require('../models');
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
        include: [
          { model: User, as: 'conductor', attributes: ['NombreCompleto'] },
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
    const { fecha, origen, destino } = req.query;
    let whereClause = { IdEstado: 1 }; // Publicado

    if (fecha) {
      const startOfDay = new Date(fecha);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(fecha);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.FechaSalida = { [Op.between]: [startOfDay, endOfDay] };
    }

    let rutaInclude = { 
      model: Ruta, as: 'ruta', 
      include: [
        { model: Ubicacion, as: 'origen' },
        { model: Ubicacion, as: 'destino' },
      ]
    };

    const viajes = await Viaje.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'conductor', attributes: ['NombreCompleto', 'Correo', 'Telefono'] },
        rutaInclude,
      ],
      order: [['FechaSalida', 'ASC']]
    });

    // Filter by text if provided (simulating Laravel's filter)
    let filtered = viajes;
    if (origen) {
      filtered = filtered.filter(v => v.ruta.origen.Nombre.toLowerCase().includes(origen.toLowerCase()));
    }
    if (destino) {
      filtered = filtered.filter(v => v.ruta.destino.Nombre.toLowerCase().includes(destino.toLowerCase()));
    }

    res.json(filtered);
  } catch (error) {
    console.error('Error searching viajes:', error);
    res.status(500).json({ message: 'Error al buscar viajes' });
  }
};

exports.create = async (req, res) => {
  try {
    const { IdOrigen, IdDestino, fechaHora, IdVehiculo, asientos, precio, notas } = req.body;
    const userId = req.user.id;

    // Overlap Check (±1 hour)
    const horaSalida = new Date(fechaHora);
    const horaInicio = new Date(horaSalida.getTime() - 60 * 60 * 1000);
    const horaFin = new Date(horaSalida.getTime() + 60 * 60 * 1000);

    const empalmeConductor = await Viaje.findOne({
      where: {
        IdConductor: userId,
        IdEstado: [1, 2],
        FechaSalida: { [Op.between]: [horaInicio, horaFin] }
      }
    });

    if (empalmeConductor) {
      return res.status(400).json({ message: 'Ya tienes un viaje programado en un margen de ±1 hora.' });
    }

    // Check overlap as passenger
    const user = await User.findByPk(userId, {
      include: [{
        model: Viaje, as: 'viajesPasajero',
        where: { 
          IdEstado: [1, 2],
          FechaSalida: { [Op.between]: [horaInicio, horaFin] }
        }
      }]
    });

    if (user && user.viajesPasajero.length > 0) {
      return res.status(400).json({ message: 'Ya tienes un viaje como pasajero en un margen de ±1 hora.' });
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
