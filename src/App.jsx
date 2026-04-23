import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import LandingPage     from './pages/LandingPage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import DashboardPage   from './pages/DashboardPage';
import ViajesList      from './pages/Viajes/ViajesList';
import ViajesCreate    from './pages/Viajes/ViajesCreate';
import ViajesSearch    from './pages/Viajes/ViajesSearch';
import VehiculoCreate  from './pages/Vehiculos/VehiculoCreate';
import CalificacionCreate from './pages/Calificaciones/CalificacionCreate';
import SolicitudesPage from './pages/SolicitudesPage';
import ChatPage        from './pages/ChatPage';
import ProfilePage     from './pages/ProfilePage';

import './styles/global.css';

/**
 * Guardia de ruta para vistas que requieren sesión activa.
 *
 * Si el usuario no está autenticado redirige automáticamente a /login,
 * preservando el intento de navegación original para redirección posterior.
 *
 * @param {{ children: React.ReactNode }} props
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/**
 * Raíz de la aplicación.
 *
 * Define el árbol de rutas de la SPA replicando
 * la estructura completa del proyecto Laravel:
 *
 * Públicas:
 *   /           → LandingPage
 *   /login      → LoginPage
 *   /register   → RegisterPage
 *
 * Protegidas (requieren sesión):
 *   /dashboard         → Panel principal
 *   /viajes            → Lista de viajes del conductor
 *   /viajes/nuevo      → Publicar viaje
 *   /buscar            → Buscar viajes disponibles
 *   /vehiculos/nuevo   → Registrar vehículo
 *   /solicitudes       → Gestión de solicitudes (conductor)
 *   /viajes/:viajeId/chat → Chat del viaje
 *   /perfil            → Perfil propio
 *   /perfil/:userId    → Perfil de otro usuario
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ─── Rutas públicas ───────────────── */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ─── Rutas protegidas ─────────────── */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

        {/* Viajes */}
        <Route path="/viajes" element={<ProtectedRoute><ViajesList /></ProtectedRoute>} />
        <Route path="/viajes/nuevo" element={<ProtectedRoute><ViajesCreate /></ProtectedRoute>} />
        <Route path="/buscar" element={<ProtectedRoute><ViajesSearch /></ProtectedRoute>} />

        {/* Vehículos */}
        <Route path="/vehiculos/nuevo" element={<ProtectedRoute><VehiculoCreate /></ProtectedRoute>} />

        {/* Solicitudes */}
        <Route path="/solicitudes" element={<ProtectedRoute><SolicitudesPage /></ProtectedRoute>} />

        {/* Chat */}
        <Route path="/viajes/:viajeId/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

        {/* Calificaciones */}
        <Route path="/calificar/:viajeId/:usuarioId" element={<ProtectedRoute><CalificacionCreate /></ProtectedRoute>} />

        {/* Perfil */}
        <Route path="/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/perfil/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* ─── Fallback ─────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
