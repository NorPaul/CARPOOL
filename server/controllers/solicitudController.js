const { SolicitudViaje, Viaje, User, ParticipanteViaje, Ruta, Ubicacion, InvitadoViaje } = require('../models');
const { Op } = require('sequelize');

exports.store = async (req, res) => {
  try {
    const userId = req.user.id;
    const { viajeId } = req.params;
    const { asientosSolicitados, invitados } = req.body; // invitados is comma-separated string

    const usuario = await User.findByPk(userId);
    const viaje = await Viaje.findByPk(viajeId);
    if (!viaje) return res.status(404).json({ message: 'Viaje no encontrado.' });

    if (viaje.IdConductor === userId) {
      return res.status(400).json({ message: 'No puedes unirte a tu propio viaje.' });
    }

    const existe = await SolicitudViaje.findOne({
      where: { IdViaje: viajeId, IdUsuario: userId, IdEstado: [1, 2] }
    });
    if (existe) {
      return res.status(400).json({ message: 'Ya tienes una solicitud activa para este viaje.' });
    }

    if (viaje.AsientosDisponibles < asientosSolicitados) {
      return res.status(400).json({ message: 'No hay suficientes asientos disponibles.' });
    }

    // Overlap check
    const horaSalida = new Date(viaje.FechaSalida);
    const horaInicio = new Date(horaSalida.getTime() - 60 * 60 * 1000);
    const horaFin = new Date(horaSalida.getTime() + 60 * 60 * 1000);

    const empalmeConductor = await Viaje.findOne({
      where: {
        IdConductor: userId,
        IdEstado: [1, 2],
        FechaSalida: { [Op.between]: [horaInicio, horaFin] }
      }
    });

    const empalmePasajero = await ParticipanteViaje.findOne({
      include: [{
        model: Viaje, as: 'viaje',
        where: {
          IdEstado: [1, 2],
          FechaSalida: { [Op.between]: [horaInicio, horaFin] }
        }
      }],
      where: { IdUsuario: userId }
    });

    if (empalmeConductor || empalmePasajero) {
      return res.status(400).json({ message: 'No puedes unirte a este viaje porque ya tienes otro programado en un margen de ±1 hora.' });
    }

    // Guest processing — filtrar correos vacíos primero
    let correosValidos = [];
    if (invitados && invitados.trim() !== '') {
      const correosArray = invitados.split(',').map(c => c.trim()).filter(c => c !== '');
      for (const c of correosArray) {
        if (c === usuario.Correo) {
          return res.status(400).json({ message: 'No te puedes agregar a ti mismo como acompañante.' });
        }
        const userCheck = await User.findOne({ where: { Correo: c } });
        if (!userCheck) {
          return res.status(400).json({ message: `El acompañante ${c} no tiene cuenta en la plataforma.` });
        }
        correosValidos.push(c);
      }
    }

    // Si hay invitados, los lugares deben cubrir al solicitante + invitados
    if (correosValidos.length > 0 && asientosSolicitados < correosValidos.length + 1) {
      return res.status(400).json({ message: `Debes reservar al menos ${correosValidos.length + 1} lugares (tú + ${correosValidos.length} invitado(s)).` });
    }

    let mensajeStr = 'Hola, me gustaría unirme a tu viaje.';
    if (correosValidos.length > 0) {
      mensajeStr = 'Invitados: ' + correosValidos.join(', ');
    }

    await SolicitudViaje.create({
      IdViaje: viajeId,
      IdUsuario: userId,
      AsientosSolicitados: asientosSolicitados,
      Mensaje: mensajeStr,
      IdEstado: 1, // Pendiente
    });

    res.status(201).json({ message: 'Solicitud enviada al conductor.' });
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ message: 'Error interno: ' + error.message });
  }
};

exports.index = async (req, res) => {
  try {
    const userId = req.user.id;
    const viajes = await Viaje.findAll({
      where: { IdConductor: userId, IdEstado: [1, 2] }, // Publicado y En Curso
      include: [
        {
          model: SolicitudViaje, as: 'solicitudes',
          where: { IdEstado: [1, 2] }, // Pendientes Y Aceptadas
          required: false,
          include: [{ model: User, as: 'usuario', attributes: ['IdUsuario', 'NombreCompleto', 'Correo'] }]
        },
        {
          model: Ruta, as: 'ruta',
          include: [
            { model: Ubicacion, as: 'origen' },
            { model: Ubicacion, as: 'destino' },
          ]
        }
      ]
    });
    res.json(viajes);
  } catch (error) {
    console.error('Error fetching solicitudes:', error);
    res.status(500).json({ message: 'Error al obtener solicitudes' });
  }
};

exports.update = async (req, res) => {
  try {
    const { solicitudId } = req.params;
    const { accion } = req.body;

    const solicitud = await SolicitudViaje.findByPk(solicitudId, {
      include: [{ model: Viaje, as: 'viaje' }]
    });
    if (!solicitud) return res.status(404).json({ message: 'Solicitud no encontrada.' });

    const viaje = solicitud.viaje;
    if (viaje.IdConductor !== req.user.id) return res.status(403).json({ message: 'No autorizado.' });
    if (solicitud.IdEstado !== 1) return res.status(400).json({ message: 'Esta solicitud ya fue procesada.' });

    if (accion === 'aceptar') {
      if (viaje.AsientosDisponibles < solicitud.AsientosSolicitados) {
        return res.status(400).json({ message: 'No hay suficientes asientos.' });
      }

      await solicitud.update({ IdEstado: 2, FechaRespuesta: new Date() });
      await viaje.update({ AsientosDisponibles: viaje.AsientosDisponibles - solicitud.AsientosSolicitados });

      // Handle guests
      if (solicitud.Mensaje.startsWith('Invitados: ')) {
        const correosStr = solicitud.Mensaje.substring(11);
        const correosArray = correosStr.split(',').map(c => c.trim());
        for (const correo of correosArray) {
          if (correo) {
            await InvitadoViaje.findOrCreate({
              where: { IdViaje: viaje.IdViaje, Correo: correo },
              defaults: { IdViaje: viaje.IdViaje, Correo: correo }
            });
            // Register guest as confirmed participant so they appear in passenger list
            const invitadoUser = await User.findOne({ where: { Correo: correo } });
            if (invitadoUser) {
              await ParticipanteViaje.findOrCreate({
                where: { IdViaje: viaje.IdViaje, IdUsuario: invitadoUser.IdUsuario },
                defaults: { IdViaje: viaje.IdViaje, IdUsuario: invitadoUser.IdUsuario, IdSolicitud: solicitud.IdSolicitud }
              });
            }
          }
        }
      }

      await ParticipanteViaje.create({
        IdViaje: viaje.IdViaje,
        IdUsuario: solicitud.IdUsuario,
        IdSolicitud: solicitud.IdSolicitud,
      });

      res.json({ message: 'Solicitud aceptada.' });
    } else {
      await solicitud.update({ IdEstado: 3, FechaRespuesta: new Date() });
      res.json({ message: 'Solicitud rechazada.' });
    }
  } catch (error) {
    console.error('Error al procesar solicitud:', error);
    res.status(500).json({ message: 'Error interno: ' + error.message });
  }
};

exports.cancelar = async (req, res) => {
  try {
    const { solicitudId } = req.params;
    const userId = req.user.id;

    const solicitud = await SolicitudViaje.findByPk(solicitudId, {
      include: [{ model: Viaje, as: 'viaje' }]
    });
    if (!solicitud) return res.status(404).json({ message: 'Solicitud no encontrada.' });

    const viaje = solicitud.viaje;
    const esConductor = (viaje.IdConductor === userId);
    if (solicitud.IdUsuario !== userId && !esConductor) {
      return res.status(403).json({ message: 'No tienes permiso.' });
    }

    if (solicitud.IdEstado === 4) return res.status(400).json({ message: 'Ya cancelada.' });

    if (solicitud.IdEstado === 2) { // Aceptada -> Liberar lugares
      await viaje.update({ AsientosDisponibles: viaje.AsientosDisponibles + solicitud.AsientosSolicitados });
      await ParticipanteViaje.destroy({ where: { IdSolicitud: solicitud.IdSolicitud } });
    }

    await solicitud.update({ IdEstado: esConductor ? 5 : 4 }); // 5: Expulsado, 4: Cancelada
    res.json({ message: esConductor ? 'Pasajero expulsado.' : 'Pasaje cancelado.' });
  } catch (error) {
    console.error('Error al cancelar solicitud:', error);
    res.status(500).json({ message: 'Error interno: ' + error.message });
  }
};

exports.dismiss = async (req, res) => {
  try {
    const solicitud = await SolicitudViaje.findByPk(req.params.solicitudId);
    if (solicitud.IdUsuario !== req.user.id) return res.status(403).json({ message: 'No autorizado' });
    
    await solicitud.update({ IdEstado: 4 }); // Marcar como cancelada/leída
    res.json({ message: 'Notificación eliminada.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al ocultar notificación' });
  }
};
