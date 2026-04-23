import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Layout from '../../components/Layout';

function ViajesSearch() {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [filters, setFilters] = useState({
    origen: searchParams.get('origen') || '',
    destino: searchParams.get('destino') || '',
    fecha: searchParams.get('fecha') || ''
  });

  const [requestData, setRequestData] = useState({
    viajeId: null,
    asientosSolicitados: 1,
    invitados: ''
  });

  const fetchResultados = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('carpool_token');
      const queryParams = new URLSearchParams(filters).toString();
      const res = await fetch(`/api/viajes/search?${queryParams}`, {
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

  useEffect(() => { fetchResultados(); }, []);

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
      alert(data.message);
      if (res.ok) setRequestData({ viajeId: null, asientosSolicitados: 1, invitados: '' });
    } catch (err) {
      alert('Error al enviar solicitud');
    }
  };

  return (
    <Layout>
      <div style={{ marginTop: '10px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Buscar Viaje</h2>

        <form onSubmit={handleSearch} className="card">
          <div className="form-group">
            <label className="form-label">Origen (Texto)</label>
            <input type="text" name="origen" className="form-control" value={filters.origen} onChange={handleChange} placeholder="Ej. TecNM" />
          </div>
          <div className="form-group">
            <label className="form-label">Destino (Texto)</label>
            <input type="text" name="destino" className="form-control" value={filters.destino} onChange={handleChange} placeholder="Ej. Villa de Álvarez" />
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Fecha (Opcional)</label>
            <input type="date" name="fecha" className="form-control" value={filters.fecha} onChange={handleChange} />
          </div>
          <button type="submit" className="btn">Aplicar Filtros</button>
        </form>

        {error && <div className="alert alert-error">{error}</div>}
        
        <h3 style={{ fontSize: '1.25rem', marginTop: '32px', marginBottom: '16px' }}>
          Resultados encontrados ({viajes.length})
        </h3>
        
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Buscando...</p>
        ) : viajes.length === 0 ? (
          <div className="card text-center">
            <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>No se encontraron viajes disponibles.</p>
          </div>
        ) : (
          viajes.map(viaje => (
            <div key={viaje.IdViaje} className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '2px' }}>
                    {viaje.ruta?.origen?.Nombre} &rarr; {viaje.ruta?.destino?.Nombre}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Conductor: {viaje.conductor?.NombreCompleto}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--blue-bright)' }}>
                    ${Number(viaje.PrecioPorPasajero).toFixed(0)}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '0.85rem' }}>
                <div>🕒 {new Date(viaje.FechaSalida).toLocaleString()}</div>
                <div>💺 {viaje.AsientosDisponibles} libres</div>
              </div>
              
              {requestData.viajeId === viaje.IdViaje ? (
                <form onSubmit={handleRequestSubmit} className="animate-up" style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div className="form-group">
                    <label className="form-label">¿Cuántos lugares necesitas?</label>
                    <input type="number" className="form-control" min="1" max={viaje.AsientosDisponibles} value={requestData.asientosSolicitados} onChange={(e) => setRequestData(prev => ({ ...prev, asientosSolicitados: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Correos de acompañantes (opcional, separados por coma)</label>
                    <input type="text" className="form-control" placeholder="amigo@ejemplo.com, otro@ejemplo.com" value={requestData.invitados} onChange={(e) => setRequestData(prev => ({ ...prev, invitados: e.target.value }))} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button type="button" onClick={() => setRequestData({ viajeId: null, asientosSolicitados: 1, invitados: '' })} className="btn btn-outline">Cancelar</button>
                    <button type="submit" className="btn">Enviar Solicitud</button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setRequestData({ viajeId: viaje.IdViaje, asientosSolicitados: 1, invitados: '' })} className="btn btn-outline" style={{ width: '100%' }}>
                  Solicitar unirse
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}

export default ViajesSearch;
