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
    res.status(500).json({ message: 'Error al crear vehículo' });
  }
};
