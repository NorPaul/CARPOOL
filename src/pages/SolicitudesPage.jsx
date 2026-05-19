import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

function SolicitudesPage() {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchSolicitudes = async () => {
    try {
      const token = localStorage.getItem('carpool_token');
      const res = await fetch('/api/solicitudes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setViajes(data);
      }
    } catch (err) {
      console.error('Error fetching solicitudes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSolicitudes(); }, []);

  const handleAction = async (solicitudId, accion) => {
    setError(null);
    setMessage(null);
    try {
      const token = localStorage.getItem('carpool_token');
      const res = await fetch(`/api/solicitudes/${solicitudId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accion })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchSolicitudes();
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error processing solicitud', err);
    }
  };

  const handleExpulsar = async (solicitudId) => {
    if (!window.confirm('¿Estás seguro de expulsar a este pasajero? El lugar se liberará.')) return;
    setError(null);
    setMessage(null);
    try {
      const token = localStorage.getItem('carpool_token');
      const res = await fetch(`/api/solicitudes/${solicitudId}/cancelar`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchSolicitudes();
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const haySolicitudes = viajes.some(v => v.solicitudes && v.solicitudes.length > 0);

  return (
    <Layout>
      <div style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', padding: '8px' }}>&larr; Volver</Link>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Solicitudes Pendientes</h2>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
        ) : !haySolicitudes ? (
          <div className="card text-center">
            <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>No tienes solicitudes pendientes por el momento.</p>
          </div>
        ) : (
          viajes.filter(v => v.solicitudes && v.solicitudes.length > 0).map(viaje => (
            <div key={viaje.IdViaje} className="card" style={{ borderLeft: '4px solid var(--blue-primary)', paddingTop: '16px' }}>
              <div style={{ marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '4px', color: 'var(--text-bright)' }}>
                  {viaje.ruta?.origen?.Nombre ?? 'Origen'} → {viaje.ruta?.destino?.Nombre ?? 'Destino'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {new Date(viaje.FechaSalida).toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })} | Asientos libres: {viaje.AsientosDisponibles}
                </p>
              </div>

              {viaje.solicitudes.map(solicitud => (
                <div key={solicitud.IdSolicitud} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>
                      {solicitud.usuario?.NombreCompleto ?? 'Usuario Desconocido'}
                      {solicitud.IdEstado === 2 && (
                        <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '3px 6px', borderRadius: '4px', marginLeft: '8px' }}>Aceptado</span>
                      )}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Solicita {solicitud.AsientosSolicitados} lugar(es)</p>
                    {solicitud.Mensaje && solicitud.Mensaje.startsWith('Invitados: ') && (
                      <p style={{ color: 'var(--accent-vivid)', fontSize: '0.75rem', marginTop: '4px' }}>
                        👥 Acompañantes: <strong>{solicitud.Mensaje.substring(11)}</strong>
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {solicitud.IdEstado === 1 ? (
                      <>
                        <button onClick={() => handleAction(solicitud.IdSolicitud, 'rechazar')} className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--danger-text)', borderColor: 'var(--danger-soft)', width: 'auto' }}>Rechazar</button>
                        <button onClick={() => handleAction(solicitud.IdSolicitud, 'aceptar')} className="btn" style={{ padding: '8px 16px', fontSize: '0.75rem', background: 'var(--blue-primary)', width: 'auto' }}>Aceptar</button>
                      </>
                    ) : (
                      <button onClick={() => handleExpulsar(solicitud.IdSolicitud)} className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--danger-red)', borderColor: 'rgba(239, 68, 68, 0.3)', width: 'auto' }}>Expulsar</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

export default SolicitudesPage;
