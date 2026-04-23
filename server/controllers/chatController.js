const { Mensaje, Viaje, User, ParticipanteViaje } = require('../models');

// Obtener mensajes de un viaje
exports.show = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const userId = req.user.id;

    const viaje = await Viaje.findByPk(viajeId);
    if (!viaje) return res.status(404).json({ message: 'Viaje no encontrado.' });

    // Verificar acceso: conductor o participante confirmado
    const esParticipante = viaje.IdConductor === userId ||
      await ParticipanteViaje.findOne({ where: { IdViaje: viajeId, IdUsuario: userId } });

    if (!esParticipante) {
      return res.status(403).json({ message: 'No tienes acceso a este chat.' });
    }

    const mensajes = await Mensaje.findAll({
      where: { IdViaje: viajeId },
      include: [{ model: User, as: 'remitente', attributes: ['NombreCompleto'] }],
      order: [['FechaEnvio', 'ASC']]
    });

    res.json({ viaje, mensajes });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Error al obtener chat' });
  }
};

// Enviar mensaje
exports.store = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const { contenido } = req.body;
    const userId = req.user.id;

    const viaje = await Viaje.findByPk(viajeId);
    if (!viaje) return res.status(404).json({ message: 'Viaje no encontrado.' });

    const esParticipante = viaje.IdConductor === userId ||
      await ParticipanteViaje.findOne({ where: { IdViaje: viajeId, IdUsuario: userId } });

    if (!esParticipante) {
      return res.status(403).json({ message: 'No autorizado.' });
    }

    const mensaje = await Mensaje.create({
      IdViaje: viajeId,
      IdRemitente: userId,
      Contenido: contenido,
    });

    // Devolver con remitente
    const full = await Mensaje.findByPk(mensaje.IdMensaje, {
      include: [{ model: User, as: 'remitente', attributes: ['NombreCompleto'] }]
    });

    res.status(201).json(full);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error al enviar mensaje' });
  }
};
