import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#020617', fontFamily: "'Outfit', sans-serif", color: '#f8fafc' }}>

      {/* Navbar */}
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg,#2563eb,#38bdf8)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(37,99,235,0.4)' }}>
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.5C2.1 11 2 11.5 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
            </svg>
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg,#f8fafc,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>CARPOOL</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500, padding: '8px 16px', borderRadius: '8px', transition: 'all 0.3s' }}>Iniciar Sesión</Link>
          <Link to="/register" style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', textDecoration: 'none', fontWeight: 700, padding: '10px 20px', borderRadius: '10px', fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(37,99,235,0.3)' }}>Registrarse</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '60px 20px 80px', textAlign: 'center', position: 'relative', background: 'radial-gradient(circle at 50% 0%, rgba(37,99,235,0.15) 0%, transparent 70%)' }}>
        <img
          src="/img/hero_carpool.png"
          alt="Carpool"
          onError={e => { e.target.style.display = 'none'; }}
          style={{ maxWidth: '560px', width: '100%', borderRadius: '24px', border: '1px solid rgba(56,189,248,0.15)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)', marginBottom: '48px', animation: 'float 4s ease-in-out infinite' }}
        />
        <h2 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 800, lineHeight: 1.2, margin: '0 auto 20px', maxWidth: '700px', background: 'linear-gradient(135deg,#f8fafc 30%,#38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Viaja más rápido, barato y con compañeros del Tec
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '520px', margin: '0 auto 44px', lineHeight: 1.7 }}>
          Comparte tus viajes, ahorra dinero y reduce tu huella de carbono.<br />
          Conecta con otros estudiantes y haz que cada trayecto cuente.
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', textDecoration: 'none', fontWeight: 700, padding: '16px 36px', borderRadius: '50px', fontSize: '1.05rem', boxShadow: '0 4px 20px rgba(37,99,235,0.4)', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '8px' }}>
            → Empieza Gratis
          </Link>
          <Link to="/login" style={{ background: 'rgba(255,255,255,0.07)', color: '#f8fafc', textDecoration: 'none', fontWeight: 600, padding: '16px 36px', borderRadius: '50px', fontSize: '1.05rem', border: '1px solid rgba(255,255,255,0.15)', transition: 'all 0.3s' }}>
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '20px 40px 80px', maxWidth: '1000px', margin: '0 auto', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px' }}>
          {[
            {
              color: 'rgba(37,99,235,0.15)', stroke: '#38bdf8',
              icon: <><circle cx="12" cy="12" r="10" strokeWidth="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/></>,
              title: 'Comparte Gastos', desc: 'Divide los gastos de gasolina y peajes. Viaja cómodamente mientras ahorras dinero cada semana.'
            },
            {
              color: 'rgba(16,185,129,0.15)', stroke: '#10b981',
              icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></>,
              title: 'Conoce Gente', desc: 'Viaja con pasajeros de tu campus y haz el trayecto más ameno. Chat en tiempo real con tu grupo.'
            },
            {
              color: 'rgba(251,191,36,0.15)', stroke: '#fbbf24',
              icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/></>,
              title: 'Ayuda al Planeta', desc: 'Menos autos significan menos emisiones. Haz tu parte compartiendo el viaje con tus compañeros.'
            },
          ].map(({ color, stroke, icon, title, desc }) => (
            <div key={title} style={{ background: 'linear-gradient(135deg,#0f172a,#111827)', border: '1px solid rgba(148,163,184,0.1)', padding: '36px 28px', borderRadius: '20px', textAlign: 'center', transition: 'all 0.3s' }}>
              <div style={{ width: '60px', height: '60px', background: color, borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="28" height="28" fill="none" stroke={stroke} viewBox="0 0 24 24">{icon}</svg>
              </div>
              <h3 style={{ color: stroke, fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px', marginTop: 0 }}>{title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '32px 20px', background: '#0f172a', color: '#64748b', fontSize: '0.85rem', borderTop: '1px solid rgba(148,163,184,0.08)' }}>
        CARPOOL © 2026 — TecNM Campus Colima. Hecho con 💙 por estudiantes, para estudiantes.
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
