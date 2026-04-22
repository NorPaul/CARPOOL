import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Landing.css';

/**
 * Página de inicio pública (Landing Page).
 *
 * Estructura:
 * - Navbar fija con links de autenticación
 * - Sección Hero con título degradado, subtítulo y CTAs
 * - Sección de Features con tres tarjetas de beneficios
 * - Footer mínimo
 *
 * Los botones CTA redirigen a /register y /login mediante React Router Link.
 */
function LandingPage() {
  return (
    <>
      <Navbar isAuthenticated={false} />

      {/* ─── Hero ─────────────────────────────── */}
      <section className="hero" aria-labelledby="hero-title">
        <h1 id="hero-title" className="hero-title">
          Viaja más rápido, barato y de forma sostenible
        </h1>
        <p className="hero-subtitle">
          Comparte tus viajes con compañeros del TecNM, ahorra dinero y reduce
          tu huella de carbono. Conecta con otros usuarios y haz que cada viaje cuente.
        </p>
        <div className="hero-cta">
          <Link to="/register" className="btn" id="cta-register">
            Empieza Gratis
          </Link>
          <Link to="/login" className="btn btn-outline" id="cta-login">
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      {/* ─── Features ─────────────────────────── */}
      <section className="features" aria-label="Beneficios de CARPOOL">

        <article className="feature-card">
          <span className="feature-icon" role="img" aria-label="Comparte gastos">⛽</span>
          <h3>Comparte Gastos</h3>
          <p>
            Divide los gastos de gasolina y peajes entre los pasajeros.
            Viaja cómodamente mientras ahorras dinero.
          </p>
        </article>

        <article className="feature-card">
          <span className="feature-icon" role="img" aria-label="Conoce gente">🤝</span>
          <h3>Conoce Gente</h3>
          <p>
            Viaja con compañeros de tu universidad o trabajo y haz
            el trayecto más ameno y productivo.
          </p>
        </article>

        <article className="feature-card">
          <span className="feature-icon" role="img" aria-label="Ayuda al planeta">🌱</span>
          <h3>Ayuda al Planeta</h3>
          <p>
            Menos autos en circulación significan menos emisiones.
            Haz tu parte compartiendo el viaje.
          </p>
        </article>

      </section>

      {/* ─── Footer ───────────────────────────── */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} CARPOOL — TecNM Campus Colima</p>
      </footer>
    </>
  );
}

export default LandingPage;
