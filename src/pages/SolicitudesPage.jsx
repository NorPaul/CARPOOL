import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

function SolicitudesPage() {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

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
    } catch (error) {
      console.error('Error fetching solicitudes', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSolicitudes(); }, []);

  const handleAction = async (solicitudId, accion) => {
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
        alert(data.message);
      }
    } catch (error) {
      console.error('Error processing solicitud', error);
    }
  };

  const handleExpulsar = async (solicitudId) => {
    if (!window.confirm('¿Estás seguro de expulsar a este pasajero? El lugar se liberará.')) return;
    try {
      const token = localStorage.getItem('carpool_token');
      const res = await fetch(`/api/solicitudes/${solicitudId}/cancelar`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMessage(data.message);
      fetchSolicitudes();
    } catch (error) {
      console.error(error);
    }
  };

  const haySolicitudes = viajes.some(v => v.solicitudes && v.solicitudes.length > 0);

  return (
    <Layout>
      <div style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', padding: '8px' }}>&larr; Volver</Link>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Gestión de Pasajeros</h2>
        </div>

        {message && <div className="alert alert-success">{message}</div>}

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
        ) : !haySolicitudes ? (
          <div className="card text-center">
            <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>No hay solicitudes pendientes en tus viajes activos.</p>
          </div>
        ) : (
          viajes.filter(v => v.solicitudes && v.solicitudes.length > 0).map(viaje => (
            <div key={viaje.IdViaje} className="card" style={{ borderLeft: '4px solid var(--blue-primary)', paddingTop: '16px' }}>
              <div style={{ marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '4px', color: 'var(--text-bright)' }}>
                  {viaje.ruta?.origen?.Nombre} &rarr; {viaje.ruta?.destino?.Nombre}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {new Date(viaje.FechaSalida).toLocaleString()} | Disponibles: {viaje.AsientosDisponibles}
                </p>
              </div>

              {viaje.solicitudes.map(solicitud => (
                <div key={solicitud.IdSolicitud} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{solicitud.usuario?.NombreCompleto}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Solicitó {solicitud.AsientosSolicitados} lugar(es)</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleAction(solicitud.IdSolicitud, 'rechazar')} className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--danger-text)', width: 'auto' }}>Rechazar</button>
                      <button onClick={() => handleAction(solicitud.IdSolicitud, 'aceptar')} className="btn" style={{ padding: '8px 16px', fontSize: '0.75rem', background: 'var(--blue-primary)', width: 'auto' }}>Aceptar</button>
                    </div>
                  </div>
                  {solicitud.Mensaje && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                      "{solicitud.Mensaje}"
                    </div>
                  )}
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
