import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import LandingPage    from './pages/LandingPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import DashboardPage  from './pages/DashboardPage';

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
 * Define el árbol de rutas de la SPA:
 * - /           → LandingPage (pública)
 * - /login      → LoginPage (pública)
 * - /register   → RegisterPage (pública)
 * - /dashboard  → DashboardPage (protegida)
 * - *           → Redirige a /
 *
 * BrowserRouter provee el contexto de historial para React Router v6.
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
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* ─── Fallback ─────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
