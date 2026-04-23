const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_in_production';

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Usamos el scope para incluir la contraseña en la búsqueda
    const user = await User.scope('withPassword').findOne({ where: { Correo: email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Laravel uses $2y$ prefix, Node.js bcrypt expects $2b$ — they are identical algorithms
    const hash = user.Contrasena.replace(/^\$2y\$/, '$2b$');
    const isMatch = await bcrypt.compare(password, hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.IdUsuario, email: user.Correo, name: user.NombreCompleto },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // No devolver la contraseña en la respuesta
    const userData = user.toJSON();
    delete userData.Contrasena;

    res.json({ message: 'Login successful', token, user: userData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validación de correo institucional (@colima.tecnm.mx)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@colima\.tecnm\.mx$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Debe utilizar su correo institucional (@colima.tecnm.mx).' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { Correo: email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Este correo ya se encuentra registrado.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      NombreCompleto: name,
      Correo: email,
      Contrasena: hashedPassword,
      Telefono: phone || null,
      Activo: true
    });

    const token = jwt.sign(
      { id: newUser.IdUsuario, email: newUser.Correo, name: newUser.NombreCompleto },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const userData = newUser.toJSON();
    delete userData.Contrasena;

    res.status(201).json({ message: 'User registered successfully', token, user: userData });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
