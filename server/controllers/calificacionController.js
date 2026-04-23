const { Calificacion } = require('../models');

exports.store = async (req, res) => {
  try {
    const { viajeId, evaluadoId } = req.params;
    const { estrellas, comentario } = req.body;
    const userId = req.user.id;

    if (Number(evaluadoId) === userId) {
      return res.status(403).json({ message: 'No puedes calificarte a ti mismo.' });
    }

    // Verificar si ya calificó
    const yaExiste = await Calificacion.findOne({
      where: { IdViaje: viajeId, IdEmisor: userId }
    });
    if (yaExiste) {
      return res.status(400).json({ message: 'Ya calificaste este viaje.' });
    }

    await Calificacion.create({
      IdViaje: viajeId,
      IdUsuario: evaluadoId,
      IdEmisor: userId,
      Estrellas: estrellas,
      Comentario: comentario || null,
    });

    res.status(201).json({ message: '¡Calificación enviada!' });
  } catch (error) {
    console.error('Error creating calificacion:', error);
    res.status(500).json({ message: 'Error al calificar' });
  }
};
