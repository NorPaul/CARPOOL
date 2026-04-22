import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/Dashboard.css';

/**
 * Panel principal del usuario autenticado.
 *
 * Muestra:
 * - Saludo personalizado con el nombre del usuario
 * - Grid de estadísticas (viajes completados, ahorro acumulado, CO₂ evitado)
 * - Sección de actividad reciente con cards de viajes
 * - Botón flotante de acción (FAB) para crear un nuevo viaje
 *
 * Los datos de ejemplo se reemplazarán por llamadas API al backend cuando
 * los controladores de Express estén implementados.
 */
function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /** Cierra sesión y redirige a la landing */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Layout>
      {/* ─── Header ───────────────────────────── */}
      <div className="dashboard-header animate-up">
        <div>
          <p className="form-label" style={{ marginBottom: '4px' }}>Bienvenido de vuelta</p>
          <h2 className="dashboard-greeting">
            Hola, <span>{user?.NombreCompleto?.split(' ')[0] ?? 'Usuario'}</span> 👋
          </h2>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-outline"
          id="btn-logout"
          style={{ width: 'auto', padding: '10px 18px', fontSize: '0.85rem' }}
        >
          Salir
        </button>
      </div>

      {/* ─── Stats ────────────────────────────── */}
      <div className="stats-grid animate-up">
        <div className="stat-box">
          <h3>12</h3>
          <p className="form-label" style={{ marginBottom: 0 }}>Viajes</p>
        </div>
        <div className="stat-box">
          <h3>$480</h3>
          <p className="form-label" style={{ marginBottom: 0 }}>Ahorro</p>
        </div>
        <div className="stat-box">
          <h3>4.8</h3>
          <p className="form-label" style={{ marginBottom: 0 }}>Calificación</p>
        </div>
        <div className="stat-box">
          <h3>24kg</h3>
          <p className="form-label" style={{ marginBottom: 0 }}>CO₂ evitado</p>
        </div>
      </div>

      {/* ─── Actividad reciente ────────────────── */}
      <section>
        <p className="section-title">Actividad reciente</p>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-bright)', marginBottom: '4px' }}>
                Colima → Coquimatlán
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hoy • 3 pasajeros</p>
            </div>
            <span className="badge badge-active">Activo</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--text-bright)', marginBottom: '4px' }}>
                TecNM → Centro Histórico
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ayer • 2 pasajeros</p>
            </div>
            <span className="badge badge-pending">Pendiente</span>
          </div>
        </div>
      </section>

      {/* ─── FAB — Crear viaje ─────────────────── */}
      <a href="/viajes/nuevo" className="fab" id="fab-nuevo-viaje" aria-label="Crear nuevo viaje">
        +
      </a>
    </Layout>
  );
}

export default DashboardPage;
