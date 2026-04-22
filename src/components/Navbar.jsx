import { Link, useNavigate } from 'react-router-dom';
import '../styles/Landing.css';

/**
 * Navbar superior de la landing page.
 *
 * Muestra el logo/marca y los links de navegación principales.
 * En estado no autenticado muestra "Iniciar Sesión" y "Registrarse".
 * En estado autenticado muestra un enlace al Dashboard.
 *
 * @param {{ isAuthenticated: boolean }} props
 */
function Navbar({ isAuthenticated = false }) {
  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">CARPOOL</Link>

      <nav className="nav-links" aria-label="Navegación principal">
        {isAuthenticated ? (
          <Link to="/dashboard" className="btn" style={{ padding: '10px 20px', fontSize: '0.9rem', width: 'auto' }}>
            Mi Panel
          </Link>
        ) : (
          <>
            <Link to="/login" className="nav-link">Iniciar Sesión</Link>
            <Link to="/register" className="btn" style={{ padding: '10px 20px', fontSize: '0.9rem', width: 'auto' }}>
              Registrarse
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
