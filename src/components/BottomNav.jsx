import { NavLink } from 'react-router-dom';

/**
 * Barra de navegación inferior flotante.
 *
 * Renderiza cuatro destinos: Inicio, Buscar, Viajes y Perfil.
 * NavLink aplica automáticamente la clase "active" a la ruta actual,
 * lo que activa los estilos de resaltado definidos en global.css.
 * Solo se monta cuando el usuario está autenticado (controlado por Layout).
 */
function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegación inferior">

      {/* Inicio */}
      <NavLink to="/dashboard" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Inicio</span>
      </NavLink>

      {/* Buscar */}
      <NavLink to="/buscar" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>Buscar</span>
      </NavLink>

      {/* Viajes */}
      <NavLink to="/viajes" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <span>Viajes</span>
      </NavLink>

      {/* Perfil */}
      <NavLink to="/perfil" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>Perfil</span>
      </NavLink>

    </nav>
  );
}

export default BottomNav;
