const { Mensaje, Viaje, User, ParticipanteViaje, InvitadoViaje, Ruta, Ubicacion } = require('../models');

// Obtener mensajes y participantes de un viaje
exports.show = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const userId = req.user.id;

    const viaje = await Viaje.findByPk(viajeId, {
      include: [
        { model: Ruta, as: 'ruta', include: [
          { model: Ubicacion, as: 'origen' },
          { model: Ubicacion, as: 'destino' },
        ]},
        { model: User, as: 'conductor', attributes: ['IdUsuario', 'NombreCompleto'] },
        { model: User, as: 'pasajeros', attributes: ['IdUsuario', 'NombreCompleto'] },
        { model: InvitadoViaje, as: 'invitados', attributes: ['Correo'] }
      ]
    });
    if (!viaje) return res.status(404).json({ message: 'Viaje no encontrado.' });

    // Verificar acceso
    const usuario = await User.findByPk(userId);
    const esParticipante = viaje.IdConductor === userId ||
      await ParticipanteViaje.findOne({ where: { IdViaje: viajeId, IdUsuario: userId } }) ||
      (usuario && await InvitadoViaje.findOne({ where: { IdViaje: viajeId, Correo: usuario.Correo } }));

    if (!esParticipante) {
      return res.status(403).json({ message: 'No tienes acceso a este chat.' });
    }

    const mensajes = await Mensaje.findAll({
      where: { IdViaje: viajeId },
      include: [{ model: User, as: 'remitente', attributes: ['IdUsuario', 'NombreCompleto'] }],
      order: [['FechaEnvio', 'ASC']]
    });

    res.json({ viaje, mensajes });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Error al obtener chat' });
  }
};

// Enviar mensaje (se mantiene igual)
exports.store = async (req, res) => {
  try {
    const { viajeId } = req.params;
    const { contenido } = req.body;
    const userId = req.user.id;

    if (!contenido || !contenido.trim()) {
      return res.status(400).json({ message: 'El mensaje no puede estar vacío.' });
    }

    const viaje = await Viaje.findByPk(viajeId);
    if (!viaje) return res.status(404).json({ message: 'Viaje no encontrado.' });

    const usuario = await User.findByPk(userId);
    const esParticipante = viaje.IdConductor === userId ||
      await ParticipanteViaje.findOne({ where: { IdViaje: viajeId, IdUsuario: userId } }) ||
      (usuario && await InvitadoViaje.findOne({ where: { IdViaje: viajeId, Correo: usuario.Correo } }));

    if (!esParticipante) return res.status(403).json({ message: 'No autorizado.' });
    if (viaje.IdEstado >= 3) return res.status(403).json({ message: 'Chat cerrado.' });

    const mensaje = await Mensaje.create({ IdViaje: viajeId, IdRemitente: userId, Contenido: contenido });
    const full = await Mensaje.findByPk(mensaje.IdMensaje, {
      include: [{ model: User, as: 'remitente', attributes: ['IdUsuario', 'NombreCompleto'] }]
    });
    res.status(201).json(full);
  } catch (error) {
    res.status(500).json({ message: 'Error al enviar' });
  }
};
