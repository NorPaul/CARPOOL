import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

function ViajesList() {
  const [data, setData] = useState({ conductor: [], pasajero: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('conductor');

  const fetchViajes = async () => {
    try {
      const token = localStorage.getItem('carpool_token');
      const res = await fetch('/api/viajes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar viajes');
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViajes();
  }, []);

  const handleAction = async (viajeId, action) => {
    let body = {};
    if (action === 'finalizar') {
      const obs = window.prompt('¿Alguna observación sobre el viaje? (Opcional)');
      if (obs === null) return; // Canceló el prompt
      body = { observaciones: obs };
    }

    try {
      const token = localStorage.getItem('carpool_token');
      const res = await fetch(`/api/viajes/${viajeId}/${action}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(body)
      });
      const result = await res.json();
      if (res.ok) fetchViajes();
      else alert(result.message);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelPasaje = async (solicitudId) => {
    if (!window.confirm('¿Estás seguro de cancelar tu lugar en este viaje?')) return;
    try {
      const token = localStorage.getItem('carpool_token');
      const res = await fetch(`/api/solicitudes/${solicitudId}/cancelar`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchViajes();
      else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (idEstado) => {
    switch (idEstado) {
      case 1: return '#3b82f6'; // Publicado
      case 2: return '#f59e0b'; // En Curso
      case 3: return '#10b981'; // Terminado
      case 5: return '#ef4444'; // Expulsado
      default: return '#ef4444'; // Cancelado
    }
  };

  const getBadgeClass = (idEstado) => {
    switch (idEstado) {
      case 1: return 'badge-active';    // Publicado
      case 2: return 'badge-progress';  // En Curso
      case 3: return 'badge-completed'; // Terminado
      case 5: return 'badge-danger';    // Expulsado/Cancelado por conductor
      default: return 'badge-danger';  // Cancelado
    }
  };

  const getStatusText = (idEstado) => {
    switch (idEstado) {
      case 1: return 'Publicado';
      case 2: return 'En Curso';
      case 3: return 'Finalizado';
      case 5: return 'Expulsado';
      default: return 'Cancelado';
    }
  };

  return (
    <Layout>
      <div className="animate-up">
        {error && <div className="alert alert-error">{error}</div>}

        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>Mis Viajes</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Gestiona tus trayectos activos y pasados</p>
          </div>
          <Link to="/viajes/nuevo" className="btn" style={{ width: 'auto', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 700 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Publicar
          </Link>
        </header>

        {/* Pestañas de Navegación */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '16px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            onClick={() => setActiveTab('conductor')}
            style={{ 
              flex: 1, padding: '12px', border: 'none', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
              background: activeTab === 'conductor' ? 'var(--blue-primary)' : 'transparent',
              color: activeTab === 'conductor' ? 'white' : 'var(--text-muted)',
              transition: 'all 0.3s ease'
            }}>
            Soy Conductor
          </button>
          <button 
            onClick={() => setActiveTab('pasajero')}
            style={{ 
              flex: 1, padding: '12px', border: 'none', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
              background: activeTab === 'pasajero' ? 'var(--blue-primary)' : 'transparent',
              color: activeTab === 'pasajero' ? 'white' : 'var(--text-muted)',
              transition: 'all 0.3s ease'
            }}>
            Soy Pasajero
          </button>
        </div>

        {loading ? (
          <div className="text-center" style={{ padding: '40px' }}>
            <div className="pulse-dot" style={{ margin: '0 auto 20px', position: 'relative' }}></div>
            <p style={{ color: 'var(--text-muted)' }}>Cargando tus viajes...</p>
          </div>
        ) : (
          <div className="tab-content">
            {activeTab === 'conductor' ? (
              data.conductor.length === 0 ? (
                <div className="card text-center" style={{ padding: '40px 20px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Aún no has publicado ningún viaje.</p>
                  <Link to="/viajes/nuevo" style={{ color: 'var(--blue-bright)', fontWeight: 600, marginTop: '12px', display: 'inline-block' }}>Comienza ahora →</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '24px' }}>
                  {data.conductor.map(viaje => {
                    const statusColor = getStatusColor(viaje.IdEstado);
                    const pasajerosConfirmados = viaje.AsientosTotales - viaje.AsientosDisponibles;
                    const recaudado = pasajerosConfirmados * Number(viaje.PrecioPorPasajero);

                    return (
                      <div key={viaje.IdViaje} className="card" style={{ borderTop: `4px solid ${statusColor}`, padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <span style={{ color: statusColor, fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            VIAJE #{viaje.IdViaje}
                          </span>
                          <span className={`badge ${getBadgeClass(viaje.IdEstado)}`}>
                            {getStatusText(viaje.IdEstado)}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px', lineHeight: 1.3 }}>
                          {viaje.ruta?.origen?.Nombre} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>→</span> {viaje.ruta?.destino?.Nombre}
                        </h3>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          {new Date(viaje.FechaSalida).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
                        </p>

                        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '20px', display: 'flex', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '8px' }}>PASAJEROS</p>
                            <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{pasajerosConfirmados} / {viaje.AsientosTotales}</p>
                          </div>
                          <div style={{ flex: 1, textAlign: 'center' }}>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '8px' }}>RECAUDADO</p>
                            <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>${recaudado.toFixed(2)}</p>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <Link to={`/viajes/${viaje.IdViaje}/chat`} className="btn" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '14px', fontSize: '0.95rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> Chat
                          </Link>
                          <Link to="/solicitudes" className="btn" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '14px', fontSize: '0.95rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> Solicitudes
                          </Link>
                        </div>

                        {/* Acciones de Cambio de Estado (Sólo visibles cuando aplique) */}
                        {viaje.IdEstado === 1 && (
                          <div style={{ marginTop: '16px' }}>
                            <button onClick={() => handleAction(viaje.IdViaje, 'iniciar')} className="btn" style={{ width: '100%', padding: '14px', fontSize: '0.95rem', fontWeight: 800 }}>INICIAR VIAJE</button>
                            <button 
                              onClick={() => { if(window.confirm('¿Estás seguro de cancelar este viaje?')) handleAction(viaje.IdViaje, 'cancelar') }} 
                              className="btn btn-outline"
                              style={{ width: '100%', marginTop: '12px', color: 'var(--danger-red)', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)', fontSize: '0.9rem' }}
                            >
                              🚫 CANCELAR VIAJE
                            </button>
                          </div>
                        )}
                        {viaje.IdEstado === 2 && (
                          <div style={{ marginTop: '16px' }}>
                            <button onClick={() => handleAction(viaje.IdViaje, 'finalizar')} className="btn" style={{ width: '100%', padding: '14px', fontSize: '0.95rem', fontWeight: 800, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>FINALIZAR VIAJE</button>
                          </div>
                        )}

                        {viaje.pasajeros && viaje.pasajeros.length > 0 && viaje.IdEstado !== 4 && (
                          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Pasajeros Confirmados</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {viaje.pasajeros.map(pas => (
                                <div key={pas.IdUsuario} style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span>{pas.NombreCompleto.split(' ')[0]}</span>
                                  {viaje.IdEstado === 3 && (
                                    <Link to={`/calificar/${viaje.IdViaje}/${pas.IdUsuario}`} title="Calificar" style={{ color: '#fbbf24', textDecoration: 'none' }}>★</Link>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              data.pasajero.length === 0 ? (
                <div className="card text-center" style={{ padding: '40px 20px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Aún no te has unido a ningún viaje.</p>
                  <Link to="/buscar" style={{ color: 'var(--blue-bright)', fontWeight: 600, marginTop: '12px', display: 'inline-block' }}>Buscar un aventón →</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '24px' }}>
                  {data.pasajero.map(viaje => {
                    const statusColor = getStatusColor(viaje.IdEstado);
                    return (
                      <div key={viaje.IdViaje} className="card" style={{ borderTop: `4px solid ${statusColor}`, padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <span style={{ color: statusColor, fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            VIAJE #{viaje.IdViaje}
                          </span>
                          <span className={`badge ${getBadgeClass(viaje.IdEstado)}`}>
                            {getStatusText(viaje.IdEstado)}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px', lineHeight: 1.3 }}>
                          {viaje.ruta?.origen?.Nombre} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>→</span> {viaje.ruta?.destino?.Nombre}
                        </h3>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          {new Date(viaje.FechaSalida).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
                        </p>
                        
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                          Conductor: <strong style={{ color: 'white' }}>{viaje.conductor?.NombreCompleto}</strong>
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <Link to={`/viajes/${viaje.IdViaje}/chat`} className="btn" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '14px', fontSize: '0.95rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> Chat
                          </Link>
                          {viaje.IdEstado === 3 ? (
                            <Link to={`/calificar/${viaje.IdViaje}/${viaje.conductor?.IdUsuario}`} className="btn" style={{ padding: '14px', fontSize: '0.95rem' }}>CALIFICAR</Link>
                          ) : viaje.IdEstado === 1 ? (
                            <button 
                              onClick={() => handleCancelPasaje(viaje.ParticipanteViaje?.IdSolicitud)} 
                              className="btn btn-outline" 
                              style={{ padding: '14px', fontSize: '0.95rem', color: 'var(--danger-red)', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
                              🚫 CANCELAR
                            </button>
                          ) : (
                            <Link to={`/perfil/${viaje.conductor?.IdUsuario}`} className="btn btn-outline" style={{ padding: '14px', fontSize: '0.95rem' }}>VER PERFIL</Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        )}
      </div>

      <style>{`
        .badge-progress { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
        .badge-completed { background: rgba(5, 150, 105, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .badge-danger { background: transparent; color: #ef4444; padding: 0; font-weight: 800; }
        .badge-active { background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
      `}</style>
    </Layout>
  );
}

export default ViajesList;
