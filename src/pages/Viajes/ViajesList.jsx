import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

function ViajesList() {
  const [data, setData] = useState({ conductor: [], pasajero: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    try {
      const token = localStorage.getItem('carpool_token');
      const res = await fetch(`/api/viajes/${viajeId}/${action}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      alert(result.message);
      fetchViajes();
    } catch (err) {
      console.error(err);
    }
  };

  const getBadgeClass = (idEstado) => {
    switch (idEstado) {
      case 1: return 'badge-active';
      case 2: return 'badge-progress';
      case 3: return 'badge-completed';
      default: return 'badge-pending';
    }
  };

  const getStatusText = (idEstado) => {
    switch (idEstado) {
      case 1: return 'Publicado';
      case 2: return 'En Curso';
      case 3: return 'Terminado';
      default: return 'Cancelado';
    }
  };

  return (
    <Layout>
      <div className="animate-up">
        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 800 }}>Mis Viajes</h1>
          <Link to="/viajes/nuevo" className="btn" style={{ width: 'auto', padding: '10px 18px', fontSize: '0.85rem' }}>+ Nuevo</Link>
        </div>

        {/* Sección Conductor */}
        <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--blue-bright)', marginBottom: '16px' }}>
          Como Conductor
        </h3>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
        ) : data.conductor.length === 0 ? (
          <div className="card text-center" style={{ padding: '30px 20px', marginBottom: '32px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No has publicado viajes aún.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
            {data.conductor.map(viaje => (
              <div key={viaje.IdViaje} className="card" style={{ borderLeft: '4px solid var(--blue-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>
                      {viaje.ruta?.origen?.Nombre} &rarr; {viaje.ruta?.destino?.Nombre}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(viaje.FechaSalida).toLocaleString()}
                    </p>
                  </div>
                  <span className={`badge ${getBadgeClass(viaje.IdEstado)}`}>
                    {getStatusText(viaje.IdEstado)}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', fontSize: '0.85rem' }}>
                  <span>💺 {viaje.AsientosDisponibles}/{viaje.AsientosTotales}</span>
                  <span>💰 ${Number(viaje.PrecioPorPasajero).toFixed(0)}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  {viaje.IdEstado === 1 && (
                    <button onClick={() => handleAction(viaje.IdViaje, 'iniciar')} className="btn" style={{ padding: '8px', fontSize: '0.75rem', background: '#10b981' }}>Iniciar</button>
                  )}
                  {viaje.IdEstado === 2 && (
                    <button onClick={() => handleAction(viaje.IdViaje, 'finalizar')} className="btn" style={{ padding: '8px', fontSize: '0.75rem', background: 'var(--blue-deep)' }}>Finalizar</button>
                  )}
                  <Link to={`/viajes/${viaje.IdViaje}/chat`} className="btn btn-outline" style={{ padding: '8px', fontSize: '0.75rem', textAlign: 'center' }}>Chat</Link>
                  <Link to="/solicitudes" className="btn btn-outline" style={{ padding: '8px', fontSize: '0.75rem', textAlign: 'center' }}>Pasajeros</Link>
                </div>

                {viaje.pasajeros && viaje.pasajeros.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Pasajeros Confirmados:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {viaje.pasajeros.map(pas => (
                        <div key={pas.IdUsuario} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>
                          <span>{pas.NombreCompleto.split(' ')[0]}</span>
                          {viaje.IdEstado === 3 && (
                            <Link to={`/calificar/${viaje.IdViaje}/${pas.IdUsuario}`} title="Calificar" style={{ color: '#fbbf24', textDecoration: 'none', fontWeight: 'bold' }}>⭐</Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sección Pasajero */}
        <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-vivid)', marginBottom: '16px' }}>
          Como Pasajero
        </h3>

        {data.pasajero.length === 0 ? (
          <div className="card text-center" style={{ padding: '30px 20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aún no te has unido a ningún viaje.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {data.pasajero.map(viaje => (
              <div key={viaje.IdViaje} className="card" style={{ borderLeft: '4px solid var(--accent-vivid)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>
                      {viaje.ruta?.origen?.Nombre} &rarr; {viaje.ruta?.destino?.Nombre}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Conductor: {viaje.conductor?.NombreCompleto}
                    </p>
                  </div>
                  <span className={`badge ${getBadgeClass(viaje.IdEstado)}`}>
                    {getStatusText(viaje.IdEstado)}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <Link to={`/viajes/${viaje.IdViaje}/chat`} className="btn btn-outline" style={{ padding: '8px', fontSize: '0.75rem', textAlign: 'center' }}>Chat</Link>
                  {viaje.IdEstado === 3 ? (
                    <Link to={`/calificar/${viaje.IdViaje}/${viaje.IdConductor}`} className="btn" style={{ padding: '8px', fontSize: '0.75rem', textAlign: 'center' }}>Calificar Conductor</Link>
                  ) : (
                    <Link to={`/perfil/${viaje.IdConductor}`} className="btn btn-outline" style={{ padding: '8px', fontSize: '0.75rem', textAlign: 'center' }}>Ver Perfil</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .badge-progress { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .badge-completed { background: rgba(148, 163, 184, 0.1); color: var(--text-muted); }
      `}</style>
    </Layout>
  );
}

export default ViajesList;
