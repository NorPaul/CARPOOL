const { Ubicacion } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const ubicaciones = await Ubicacion.findAll({ order: [['Nombre', 'ASC']] });
    res.json(ubicaciones);
  } catch (error) {
    console.error('Error fetching ubicaciones:', error);
    res.status(500).json({ message: 'Error al obtener ubicaciones' });
  }
};
