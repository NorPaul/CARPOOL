import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

const PER_PAGE = 5;

function paginate(arr, page) {
  const start = (page - 1) * PER_PAGE;
  return arr.slice(start, start + PER_PAGE);
}

function Pagination({ total, page, onPage }) {
  const pages = Math.ceil(total / PER_PAGE);
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
      {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onPage(p)}
          style={{
            width: '36px', height: '36px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
            background: p === page ? 'var(--blue-primary)' : 'rgba(255,255,255,0.05)',
            color: p === page ? 'white' : 'var(--text-muted)',
          }}
        >{p}</button>
      ))}
    </div>
  );
}

function ViajesList() {
  const [data, setData] = useState({ conductor: [], pasajero: [], avisos: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('conductor');
  const [filters, setFilters] = useState({ estado: 'activos', fecha: 'todos' });
  const [pageConductor, setPageConductor] = useState(1);
  const [pagePasajero, setPagePasajero] = useState(1);

  const fetchViajes = async (f = filters) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('carpool_token');
      const params = new URLSearchParams({ estado: f.estado, fecha: f.fecha });
      const res = await fetch(`/api/viajes?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar viajes');
      const result = await res.json();
      setData(result);
      setPageConductor(1);
      setPagePasajero(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchViajes(); }, []);

  const handleFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    fetchViajes(next);
  };

  const handleAction = async (viajeId, action) => {
    let body = {};
    if (action === 'finalizar') {
      const obs = window.prompt('¿Alguna observación sobre el viaje? (Opcional)');
      if (obs === null) return;
      body = { observaciones: obs };
    }
    try {
      const token = localStorage.getItem('carpool_token');
      const res = await fetch(`/api/viajes/${viajeId}/${action}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
      else { const d = await res.json(); alert(d.message); }
    } catch (err) { console.error(err); }
  };

  const handleDismissAviso = async (solicitudId) => {
    try {
      const token = localStorage.getItem('carpool_token');
      await fetch(`/api/solicitudes/${solicitudId}/dismiss`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setData(prev => ({ ...prev, avisos: prev.avisos.filter(a => a.IdSolicitud !== solicitudId) }));
    } catch (err) { console.error(err); }
  };

  const statusColor = (s) => ({ 1: '#3b82f6', 2: '#f59e0b', 3: '#10b981' }[s] ?? '#ef4444');
  const statusBadge = (s) => ({ 1: 'badge-active', 2: 'badge-progress', 3: 'badge-completed' }[s] ?? 'badge-danger');
  const statusText = (s) => ({ 1: 'Publicado', 2: 'En Curso', 3: 'Finalizado', 4: 'Cancelado', 5: 'Expulsado' }[s] ?? 'Cancelado');

  const conductorPage = paginate(data.conductor, pageConductor);
  const pasajeroPage = paginate(data.pasajero, pagePasajero);

  const FilterBar = () => (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: '140px' }}>
        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Estado</label>
        <select
          className="form-control"
          value={filters.estado}
          onChange={e => handleFilter('estado', e.target.value)}
          style={{ appearance: 'auto', backgroundColor: 'var(--surface-color)', fontSize: '0.85rem', padding: '10px 12px' }}
        >
          <option value="activos">Activos</option>
          <option value="historial">Historial</option>
          <option value="todos">Todos</option>
        </select>
      </div>
      <div style={{ flex: 1, minWidth: '140px' }}>
        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>Período</label>
        <select
          className="form-control"
          value={filters.fecha}
          onChange={e => handleFilter('fecha', e.target.value)}
          style={{ appearance: 'auto', backgroundColor: 'var(--surface-color)', fontSize: '0.85rem', padding: '10px 12px' }}
        >
          <option value="todos">Todos</option>
          <option value="mes">Este mes</option>
          <option value="anio">Este año</option>
        </select>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="animate-up">
        {error && <div className="alert alert-error">{error}</div>}

        <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>Mis Viajes</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gestiona tus trayectos activos y pasados</p>
          </div>
          <Link to="/viajes/nuevo" className="btn" style={{ width: 'auto', padding: '10px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Publicar
          </Link>
        </header>

        {/* Avisos recientes */}
        {data.avisos?.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Avisos Recientes</p>
            {data.avisos.map(aviso => (
              <div key={aviso.IdSolicitud} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '14px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444', marginBottom: '2px' }}>
                    {aviso.IdEstado === 5 ? 'Fuiste expulsado de un viaje' : 'Tu solicitud fue rechazada'}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {aviso.viaje?.ruta?.origen?.Nombre} → {aviso.viaje?.ruta?.destino?.Nombre}
                  </p>
                </div>
                <button
                  onClick={() => handleDismissAviso(aviso.IdSolicitud)}
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Entendido
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {['conductor', 'pasajero'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '12px', border: 'none', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
              background: activeTab === tab ? 'var(--blue-primary)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-muted)',
              transition: 'all 0.3s ease'
            }}>
              {tab === 'conductor' ? 'Soy Conductor' : 'Soy Pasajero'}
            </button>
          ))}
        </div>

        <FilterBar />

        {loading ? (
          <div className="text-center" style={{ padding: '40px' }}>
            <p style={{ color: 'var(--text-muted)' }}>Cargando tus viajes...</p>
          </div>
        ) : activeTab === 'conductor' ? (
          <>
            {data.conductor.length === 0 ? (
              <div className="card text-center" style={{ padding: '40px 20px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No hay viajes para mostrar.</p>
                <Link to="/viajes/nuevo" style={{ color: 'var(--blue-bright)', fontWeight: 600, marginTop: '12px', display: 'inline-block' }}>Publica uno →</Link>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Mostrando {Math.min(PER_PAGE, data.conductor.length - (pageConductor - 1) * PER_PAGE)} de {data.conductor.length} viaje{data.conductor.length !== 1 ? 's' : ''}
                </p>
                <div style={{ display: 'grid', gap: '20px' }}>
                  {conductorPage.map(viaje => {
                    const pasajerosConfirmados = viaje.AsientosTotales - viaje.AsientosDisponibles;
                    const recaudado = pasajerosConfirmados * Number(viaje.PrecioPorPasajero);
                    const sc = statusColor(viaje.IdEstado);
                    return (
                      <div key={viaje.IdViaje} className="card" style={{ borderTop: `4px solid ${sc}`, padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ color: sc, fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>VIAJE #{viaje.IdViaje}</span>
                          <span className={`badge ${statusBadge(viaje.IdEstado)}`}>{statusText(viaje.IdEstado)}</span>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1.3 }}>
                          {viaje.ruta?.origen?.Nombre} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>→</span> {viaje.ruta?.destino?.Nombre}
                        </h3>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          {new Date(viaje.FechaSalida).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
                        </p>

                        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '10px', padding: '14px', display: 'flex', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '6px' }}>PASAJEROS</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 800 }}>{pasajerosConfirmados} / {viaje.AsientosTotales}</p>
                          </div>
                          <div style={{ flex: 1, textAlign: 'center' }}>
                            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.05em', marginBottom: '6px' }}>RECAUDADO</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>${recaudado.toFixed(2)}</p>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <Link to={`/viajes/${viaje.IdViaje}/chat`} className="btn" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Chat
                          </Link>
                          <Link to="/solicitudes" className="btn" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Solicitudes
                          </Link>
                        </div>

                        {viaje.IdEstado === 1 && (
                          <div style={{ marginTop: '12px' }}>
                            <button onClick={() => handleAction(viaje.IdViaje, 'iniciar')} className="btn" style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 800 }}>INICIAR VIAJE</button>
                            <button
                              onClick={() => { if (window.confirm('¿Estás seguro de cancelar este viaje?')) handleAction(viaje.IdViaje, 'cancelar'); }}
                              className="btn btn-outline"
                              style={{ width: '100%', marginTop: '10px', color: 'var(--danger-red)', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', fontSize: '0.85rem' }}
                            >🚫 CANCELAR VIAJE</button>
                          </div>
                        )}
                        {viaje.IdEstado === 2 && (
                          <div style={{ marginTop: '12px' }}>
                            <button onClick={() => handleAction(viaje.IdViaje, 'finalizar')} className="btn" style={{ width: '100%', padding: '12px', fontSize: '0.9rem', fontWeight: 800, background: 'linear-gradient(135deg,#10b981 0%,#059669 100%)' }}>FINALIZAR VIAJE</button>
                            <button
                              onClick={() => { if (window.confirm('¿Estás seguro de cancelar este viaje en curso?')) handleAction(viaje.IdViaje, 'cancelar'); }}
                              className="btn btn-outline"
                              style={{ width: '100%', marginTop: '10px', color: 'var(--danger-red)', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', fontSize: '0.85rem' }}
                            >🚫 CANCELAR VIAJE</button>
                          </div>
                        )}

                        {viaje.pasajeros?.length > 0 && viaje.IdEstado !== 4 && (
                          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>Pasajeros Confirmados</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {viaje.pasajeros.map(pas => (
                                <div key={pas.IdUsuario} style={{ background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                <Pagination total={data.conductor.length} page={pageConductor} onPage={setPageConductor} />
              </>
            )}
          </>
        ) : (
          <>
            {data.pasajero.length === 0 ? (
              <div className="card text-center" style={{ padding: '40px 20px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No hay viajes para mostrar.</p>
                <Link to="/buscar" style={{ color: 'var(--blue-bright)', fontWeight: 600, marginTop: '12px', display: 'inline-block' }}>Buscar un aventón →</Link>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Mostrando {Math.min(PER_PAGE, data.pasajero.length - (pagePasajero - 1) * PER_PAGE)} de {data.pasajero.length} viaje{data.pasajero.length !== 1 ? 's' : ''}
                </p>
                <div style={{ display: 'grid', gap: '20px' }}>
                  {pasajeroPage.map(viaje => {
                    const sc = statusColor(viaje.IdEstado);
                    const solicitudId = viaje.ParticipanteViaje?.IdSolicitud;
                    return (
                      <div key={viaje.IdViaje} className="card" style={{ borderTop: `4px solid ${sc}`, padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ color: sc, fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>VIAJE #{viaje.IdViaje}</span>
                          <span className={`badge ${statusBadge(viaje.IdEstado)}`}>{statusText(viaje.IdEstado)}</span>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1.3 }}>
                          {viaje.ruta?.origen?.Nombre} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>→</span> {viaje.ruta?.destino?.Nombre}
                        </h3>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          {new Date(viaje.FechaSalida).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
                        </p>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                          Conductor: <strong style={{ color: 'white' }}>{viaje.conductor?.NombreCompleto}</strong>
                          <span style={{ marginLeft: '12px', color: '#10b981', fontWeight: 700 }}>${Number(viaje.PrecioPorPasajero).toFixed(0)}</span>
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <Link to={`/viajes/${viaje.IdViaje}/chat`} className="btn" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Chat
                          </Link>
                          {viaje.IdEstado === 3 ? (
                            <Link to={`/calificar/${viaje.IdViaje}/${viaje.conductor?.IdUsuario}`} className="btn" style={{ padding: '12px', fontSize: '0.85rem' }}>⭐ CALIFICAR</Link>
                          ) : viaje.IdEstado === 1 && solicitudId ? (
                            <button onClick={() => handleCancelPasaje(solicitudId)} className="btn btn-outline" style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--danger-red)', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
                              🚫 CANCELAR
                            </button>
                          ) : (
                            <Link to={`/perfil/${viaje.conductor?.IdUsuario}`} className="btn btn-outline" style={{ padding: '12px', fontSize: '0.85rem' }}>VER PERFIL</Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Pagination total={data.pasajero.length} page={pagePasajero} onPage={setPagePasajero} />
              </>
            )}
          </>
        )}
      </div>

      <style>{`
        .badge-progress { background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
        .badge-completed { background: rgba(5,150,105,0.2); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .badge-danger { background: transparent; color: #ef4444; padding: 0; font-weight: 800; }
        .badge-active { background: rgba(59,130,246,0.15); color: #3b82f6; border: 1px solid rgba(59,130,246,0.2); }
      `}</style>
    </Layout>
  );
}

export default ViajesList;
