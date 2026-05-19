const { Vehiculo } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const vehiculos = await Vehiculo.findAll({
      where: { IdUsuario: req.user.id }
    });
    res.json(vehiculos);
  } catch (error) {
    console.error('Error fetching vehiculos:', error);
    res.status(500).json({ message: 'Error al obtener vehículos' });
  }
};

exports.create = async (req, res) => {
  try {
    const { modelo, placas, color, capacidad } = req.body;
    const nuevoVehiculo = await Vehiculo.create({
      IdUsuario: req.user.id,
      Modelo: modelo,
      Placas: placas,
      Color: color,
      Capacidad: capacidad,
      Activo: true
    });
    res.status(201).json(nuevoVehiculo);
  } catch (error) {
    console.error('Error creating vehiculo:', error);
    if (error.original?.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Esas placas ya están registradas. Usa unas placas diferentes.' });
    }
    res.status(500).json({ message: 'Error al crear vehículo' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { modelo, placas, color, capacidad } = req.body;
    const vehiculo = await Vehiculo.findByPk(id);

    if (!vehiculo) return res.status(404).json({ message: 'Vehículo no encontrado' });
    if (vehiculo.IdUsuario !== req.user.id) return res.status(403).json({ message: 'No autorizado' });

    await vehiculo.update({
      Modelo: modelo,
      Placas: placas,
      Color: color,
      Capacidad: capacidad
    });

    res.json(vehiculo);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar vehículo' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const vehiculo = await Vehiculo.findByPk(id);

    if (!vehiculo) return res.status(404).json({ message: 'Vehículo no encontrado' });
    if (vehiculo.IdUsuario !== req.user.id) return res.status(403).json({ message: 'No autorizado' });

    // En Laravel a veces se usa borrado lógico. Aquí lo borraremos físicamente o cambiaremos Activo: false
    await vehiculo.destroy();

    res.json({ message: 'Vehículo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar vehículo' });
  }
};
