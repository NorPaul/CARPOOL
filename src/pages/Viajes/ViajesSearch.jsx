import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

function ViajesSearch() {
  const [viajes, setViajes] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [filters, setFilters] = useState({
    IdOrigen: '',
    IdDestino: '',
    fecha: ''
  });

  const [requestData, setRequestData] = useState({
    viajeId: null,
    asientosSolicitados: 1,
    invitados: ''
  });

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const token = localStorage.getItem('carpool_token');
        const res = await fetch('/api/ubicaciones', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUbicaciones(data);
        }
      } catch (err) {
        console.error('Error fetching ubicaciones', err);
      }
    };
    fetchUbicaciones();
    fetchResultados();
  }, []);

  const fetchResultados = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('carpool_token');
      const params = new URLSearchParams();
      if (filters.IdOrigen) params.set('IdOrigen', filters.IdOrigen);
      if (filters.IdDestino) params.set('IdDestino', filters.IdDestino);
      if (filters.fecha) params.set('fecha', filters.fecha);

      const res = await fetch(`/api/viajes/search?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al buscar viajes');
      const data = await res.json();
      setViajes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResultados();
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('carpool_token');
      const res = await fetch(`/api/solicitudes/${requestData.viajeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          asientosSolicitados: requestData.asientosSolicitados,
          invitados: requestData.invitados
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        setRequestData({ viajeId: null, asientosSolicitados: 1, invitados: '' });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error al enviar solicitud');
    }
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  };

  return (
    <Layout>
      <div className="animate-up">
        <div style={{ marginBottom: '32px' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Buscar Aventón</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Encuentra compañeros para tu próximo viaje</p>
        </div>

        <form onSubmit={handleSearch} className="card">
          <div className="form-group">
            <label className="form-label">Origen</label>
            <select name="IdOrigen" className="form-control" value={filters.IdOrigen} onChange={handleChange} style={{ appearance: 'auto', backgroundColor: 'var(--surface-color)' }}>
              <option value="">Cualquier origen</option>
              {ubicaciones.map(ub => (
                <option key={ub.IdUbicacion} value={ub.IdUbicacion}>{ub.Nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Destino</label>
            <select name="IdDestino" className="form-control" value={filters.IdDestino} onChange={handleChange} style={{ appearance: 'auto', backgroundColor: 'var(--surface-color)' }}>
              <option value="">Cualquier destino</option>
              {ubicaciones.map(ub => (
                <option key={ub.IdUbicacion} value={ub.IdUbicacion}>{ub.Nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group mb-6">
            <label className="form-label">Fecha (Opcional)</label>
            <input type="date" name="fecha" className="form-control" value={filters.fecha} onChange={handleChange} />
          </div>
          <button type="submit" className="btn">Aplicar Filtros</button>
        </form>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <h3 style={{ fontSize: '1.25rem', marginTop: '32px', marginBottom: '16px' }}>
          Resultados encontrados ({viajes.length})
        </h3>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Buscando...</p>
        ) : viajes.length === 0 ? (
          <div className="card text-center">
            <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>No se encontraron viajes disponibles con estos filtros.</p>
          </div>
        ) : (
          viajes.map(viaje => (
            <div key={viaje.IdViaje} className="card" style={{ borderLeft: '4px solid var(--blue-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '4px', fontWeight: 700 }}>
                    {viaje.ruta?.origen?.Nombre} → {viaje.ruta?.destino?.Nombre}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    {viaje.conductor?.NombreCompleto}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Costo</p>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>${Number(viaje.PrecioPorPasajero).toFixed(0)}</span>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '2px' }}>Salida</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{formatDate(viaje.FechaSalida)} {formatTime(viaje.FechaSalida)}</p>
                </div>
                <div style={{ width: '1px', background: 'var(--border)' }}></div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '2px' }}>Lugares</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{viaje.AsientosDisponibles} disp.</p>
                </div>
              </div>

              {requestData.viajeId === viaje.IdViaje ? (
                <form onSubmit={handleRequestSubmit} className="animate-up" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.6rem' }}>LUGARES</label>
                      <input type="number" className="form-control" min="1" max={viaje.AsientosDisponibles}
                        value={requestData.asientosSolicitados}
                        onChange={(e) => setRequestData(prev => ({ ...prev, asientosSolicitados: parseInt(e.target.value) || 1 }))}
                        style={{ padding: '10px', textAlign: 'center' }} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.6rem' }}>INVITADOS (OPCIONAL)</label>
                      <input type="text" className="form-control" placeholder="ejemplo@tecnm.mx"
                        value={requestData.invitados}
                        onChange={(e) => setRequestData(prev => ({ ...prev, invitados: e.target.value }))}
                        style={{ padding: '10px', fontSize: '0.85rem' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button type="button" onClick={() => setRequestData({ viajeId: null, asientosSolicitados: 1, invitados: '' })} className="btn btn-outline" style={{ padding: '12px', fontSize: '0.9rem' }}>Cancelar</button>
                    <button type="submit" className="btn" style={{ padding: '12px', fontSize: '0.9rem' }}>Solicitar Viaje</button>
                  </div>
                </form>
              ) : viaje.AsientosDisponibles > 0 ? (
                <button onClick={() => setRequestData({ viajeId: viaje.IdViaje, asientosSolicitados: 1, invitados: '' })} className="btn" style={{ padding: '12px', fontSize: '0.9rem' }}>
                  Solicitar Viaje
                </button>
              ) : (
                <div style={{ background: 'var(--danger-soft)', color: 'var(--danger-text)', padding: '12px', borderRadius: '12px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                  Viaje Completo
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

export default ViajesSearch;
