const { User, Vehiculo, Calificacion, Viaje } = require('../models');

exports.show = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    const usuario = await User.findByPk(userId);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado.' });

    // Calificación promedio
    const calResult = await Calificacion.findAll({
      where: { IdUsuario: userId },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('Estrellas')), 'promedio'],
        [require('sequelize').fn('COUNT', require('sequelize').col('IdCalificacion')), 'total']
      ],
      raw: true,
    });
    const calificacion = calResult[0]?.promedio ? Number(calResult[0].promedio).toFixed(1) : '0.0';
    const totalCalificaciones = calResult[0]?.total || 0;

    // Vehículos
    const vehiculos = await Vehiculo.findAll({ where: { IdUsuario: userId } });

    // Reseñas
    const resenas = await Calificacion.findAll({
      where: { IdUsuario: userId },
      include: [
        { model: User, as: 'emisor', attributes: ['NombreCompleto'] },
        { model: Viaje, as: 'viaje' }
      ],
      order: [['FechaCreacion', 'DESC']],
      limit: 10,
    });

    res.json({
      usuario,
      calificacion,
      totalCalificaciones,
      vehiculos,
      resenas
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
};

exports.update = async (req, res) => {
  try {
    const userId = req.user.id;
    const { NombreCompleto, Telefono } = req.body;
    
    const usuario = await User.findByPk(userId);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    await usuario.update({
      NombreCompleto: NombreCompleto || usuario.NombreCompleto,
      Telefono: Telefono !== undefined ? (Telefono || null) : usuario.Telefono
    });

    res.json({ message: 'Perfil actualizado correctamente', usuario });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
};
