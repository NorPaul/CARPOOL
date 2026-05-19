require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const viajeRoutes = require('./routes/viajes');
const vehiculoRoutes = require('./routes/vehiculos');
const solicitudRoutes = require('./routes/solicitudes');
const chatRoutes = require('./routes/chat');
const profileRoutes = require('./routes/profile');
const calificacionRoutes = require('./routes/calificaciones');
const ubicacionRoutes = require('./routes/ubicaciones');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Carpool API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/viajes', viajeRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/perfil', profileRoutes);
app.use('/api/calificaciones', calificacionRoutes);
app.use('/api/ubicaciones', ubicacionRoutes);

// Sync Database & Start Server
sequelize.authenticate()
  .then(() => {
    console.log('✅ Connection to MySQL has been established successfully.');
    return sequelize.sync({ force: false });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
  });
