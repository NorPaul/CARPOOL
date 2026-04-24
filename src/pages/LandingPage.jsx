import { Link } from 'react-router-dom';
import '../styles/Landing.css';

function LandingPage() {
  return (
    <div className="landing-container animate-up">
      <div className="landing-hero">
        <div className="hero-content">
          <div className="badge-new">NUEVA VERSIÓN 2.0</div>
          <h1 className="hero-title">
            Viaja Seguro, <br />
            <span className="text-gradient">Viaja en Comunidad</span>
          </h1>
          <p className="hero-description">
            La plataforma exclusiva de Carpool para la comunidad del <strong>TecNM Campus Colima</strong>. 
            Ahorra gastos, conoce gente y llega a tiempo.
          </p>
          
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary">INICIAR SESIÓN</Link>
            <Link to="/register" className="btn btn-outline">CREAR CUENTA</Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="car-blob">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.5C2.1 11 2 11.5 2 12v4c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </div>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🛡️</div>
          <h3>Seguridad</h3>
          <p>Solo usuarios con correo institucional verificado pueden participar.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💰</div>
          <h3>Economía</h3>
          <p>Divide los gastos de gasolina entre todos los pasajeros.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌱</div>
          <h3>Sostenibilidad</h3>
          <p>Menos autos en las calles significa una menor huella de carbono.</p>
        </div>
      </div>

      <footer className="landing-footer">
        <p>&copy; 2026 CARPOOL TecNM Colima. Desarrollado para la comunidad estudiantil.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
