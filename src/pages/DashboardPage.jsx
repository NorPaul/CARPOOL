import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({
    stats: { viajesConductor: 0, viajesPasajero: 0, ganancias: 0, reputacion: '0.0', pendientesCount: 0 },
    notificaciones: [],
    enCursoPasajero: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('carpool_token');
        const res = await fetch('/api/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error loading dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleDismiss = async (solicitudId) => {
    try {
      const token = localStorage.getItem('carpool_token');
      await fetch(`/api/solicitudes/${solicitudId}/dismiss`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setData(prev => ({
        ...prev,
        notificaciones: prev.notificaciones.filter(n => n.IdSolicitud !== solicitudId)
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <Layout><div className="text-center" style={{ padding: '40px' }}><p style={{ color: 'var(--text-muted)' }}>Cargando tu panel...</p></div></Layout>;

  return (
    <Layout>
      <div className="animate-up">
        
        {/* Header Section */}
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Panel Principal</p>
            <h1 className="text-gradient" style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Hola, {user?.NombreCompleto?.split(' ')[0]}
            </h1>
          </div>
          <Link to="/perfil" style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, var(--blue-primary), #8b5cf6)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.3)', textDecoration: 'none' }}>
            <span style={{ fontWeight: 800, color: 'white', fontSize: '1.2rem' }}>{user?.NombreCompleto?.charAt(0)}</span>
          </Link>
        </header>

        {/* Reputation & Earnings Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', border: 'none' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Reputación</p>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {data.stats.reputacion} <span style={{ fontSize: '1.2rem' }}>⭐</span>
            </div>
          </div>

          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '4px solid #10b981' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Ganancias</p>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>
              ${data.stats.ganancias.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <div className="stat-card">
            <div className="icon-bg" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--blue-bright)' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </div>
            <h3>{data.stats.viajesConductor}</h3>
            <p>Conductores</p>
          </div>

          <div className="stat-card">
            <div className="icon-bg" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--accent-vivid)' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <h3>{data.stats.viajesPasajero}</h3>
            <p>Pasajeros</p>
          </div>
        </div>

        {/* Active Notifications / Pending Actions */}
        {data.enCursoPasajero.map(v => (
          <Link key={v.IdViaje} to="/viajes" className="notification-banner" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', marginBottom: '12px' }}>
            <div className="banner-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M21 16.5c0 .38-.21.71-.53.88l-7.97 4.43c-.16.09-.33.14-.5.14s-.34-.05-.5-.14l-7.97-4.43c-.32-.17-.53-.5-.53-.88V7.5c0-.38.21-.71.53-.88l7.97-4.43c.16-.09.33-.14.5-.14s.34.05.5.14l7.97 4.43c.32.17.53.5.53.88v9z"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>¡Tu viaje ha comenzado!</p>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Camino a <strong>{v.ruta?.destino?.Nombre}</strong> con {v.conductor?.NombreCompleto?.split(' ')[0]}.</p>
            </div>
            <div style={{ color: 'white', opacity: 0.8 }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
          </Link>
        ))}

        {data.notificaciones.map(n => (
          <div key={n.IdSolicitud} className="notification-banner" style={{ background: `linear-gradient(135deg, ${n.IdEstado === 5 ? 'var(--danger-red)' : '#f59e0b'} 0%, ${n.IdEstado === 5 ? 'var(--danger-dark)' : '#d97706'} 100%)`, marginBottom: '12px' }}>
            <div className="banner-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
              {n.IdEstado === 5 ? (
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              ) : (
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>{n.IdEstado === 5 ? '¡Atención!' : 'Solicitud Rechazada'}</p>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>
                {n.IdEstado === 5 
                  ? `Has sido removido del viaje a ${n.viaje?.ruta?.destino?.Nombre}`
                  : `Tu solicitud para el viaje a ${n.viaje?.ruta?.destino?.Nombre} ha sido rechazada.`}
              </p>
            </div>
            <button onClick={() => handleDismiss(n.IdSolicitud)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '5px' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        ))}

        {data.stats.pendientesCount > 0 && (
          <Link to="/solicitudes" className="notification-banner">
            <div className="banner-icon">
              <span className="pulse-dot"></span>
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zm10-6v-5a8 8 0 00-5-7.3V3a3 3 0 00-6 0v.7A8 8 0 002 11v5l-2 2v1h24v-1l-2-2z"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>{data.stats.pendientesCount} Solicitudes</p>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Tienes pasajeros esperando respuesta</p>
            </div>
            <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
        )}

        {/* Main Actions */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>¿A dónde vamos hoy?</p>
          <div style={{ display: 'grid', gap: '12px' }}>
            <Link to="/viajes/nuevo" className="btn action-btn">
              <div className="btn-icon" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              </div>
              <span>Publicar un Viaje</span>
            </Link>
            <Link to="/buscar" className="btn btn-outline action-btn" style={{ borderWidth: '1.5px', background: 'rgba(255,255,255,0.03)' }}>
              <div className="btn-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--blue-primary)' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <span>Buscar Aventón</span>
            </Link>
          </div>
        </div>

        {/* Logout Quick Action */}
        <footer style={{ marginTop: '24px', textAlign: 'center' }}>
          <button onClick={handleLogout} className="logout-btn">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Cerrar Sesión
          </button>
        </footer>
      </div>
    </Layout>
  );
}

export default DashboardPage;
