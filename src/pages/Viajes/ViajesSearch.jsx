import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const anioActual = new Date().getFullYear();
const ANIOS = [anioActual, anioActual + 1];
const DIAS = Array.from({ length: 31 }, (_, i) => i + 1);

function ViajesSearch() {
  const [viajes, setViajes] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [filters, setFilters] = useState({
    IdOrigen: '',
    IdDestino: '',
    dia: '',
    mes: '',
    anio: String(anioActual),
  });

  const [requestData, setRequestData] = useState({
    viajeId: null,
    asientosSolicitados: 1,
    invitados: [''],
  });

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const token = localStorage.getItem('carpool_token');
        const res = await fetch('/api/ubicaciones', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setUbicaciones(await res.json());
      } catch (err) {
        console.error(err);
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
      if (filters.dia && filters.mes) {
        const mes = String(MESES.indexOf(filters.mes) + 1).padStart(2, '0');
        const dia = String(filters.dia).padStart(2, '0');
        params.set('fecha', `${filters.anio}-${mes}-${dia}`);
      }
      const res = await fetch(`/api/viajes/search?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al buscar viajes');
      setViajes(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResultados();
  };

  const handleSolicitar = async () => {
    setError(null);
    setSuccess(null);

    // Validar: por cada lugar extra debe haber un correo de invitado
    const invitadosValidos = requestData.invitados.filter(i => i.trim() !== '');
    const lugaresExtra = requestData.asientosSolicitados - 1;
    if (invitadosValidos.length < lugaresExtra) {
      setError(`Debes ingresar el correo de ${lugaresExtra} compañero(s) para reservar ${requestData.asientosSolicitados} lugares.`);
      return;
    }

    try {
      const token = localStorage.getItem('carpool_token');
      const res = await fetch(`/api/solicitudes/${requestData.viajeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          asientosSolicitados: requestData.asientosSolicitados,
          invitados: invitadosValidos.join(','),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || '¡Solicitud enviada con éxito!');
        setRequestData({ viajeId: null, asientosSolicitados: 1, invitados: [''] });
      } else {
        setError(data.message || 'Error al enviar solicitud');
      }
    } catch {
      setError('Error de conexión');
    }
  };

  const abrirSolicitud = (viaje) => {
    setRequestData({ viajeId: viaje.IdViaje, asientosSolicitados: 1, invitados: [''] });
  };

  const cerrarSolicitud = () => {
    setRequestData({ viajeId: null, asientosSolicitados: 1, invitados: [''] });
  };

  const formatTime = (d) => new Date(d).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
  const formatDate = (d) => new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });

  return (
    <Layout>
      <div className="animate-up">
        <div style={{ marginBottom: '32px' }}>
          <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Buscar Aventón</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Encuentra compañeros para tu próximo viaje</p>
        </div>

        {/* Filtros */}
        <form onSubmit={handleSearch} className="card">
          <div className="form-group">
            <label className="form-label">Origen</label>
            <select
              className="form-control"
              value={filters.IdOrigen}
              onChange={e => setFilters(p => ({ ...p, IdOrigen: e.target.value }))}
              style={{ appearance: 'auto', backgroundColor: 'var(--surface-color)' }}
            >
              <option value="">Cualquier origen</option>
              {ubicaciones.map(ub => <option key={ub.IdUbicacion} value={ub.IdUbicacion}>{ub.Nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Destino</label>
            <select
              className="form-control"
              value={filters.IdDestino}
              onChange={e => setFilters(p => ({ ...p, IdDestino: e.target.value }))}
              style={{ appearance: 'auto', backgroundColor: 'var(--surface-color)' }}
            >
              <option value="">Cualquier destino</option>
              {ubicaciones.map(ub => <option key={ub.IdUbicacion} value={ub.IdUbicacion}>{ub.Nombre}</option>)}
            </select>
          </div>
          <div className="form-group mb-6">
            <label className="form-label">Fecha (Opcional)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '8px' }}>
              <select
                className="form-control"
                value={filters.dia}
                onChange={e => setFilters(p => ({ ...p, dia: e.target.value }))}
                style={{ appearance: 'auto', backgroundColor: 'var(--surface-color)' }}
              >
                <option value="">Día</option>
                {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                className="form-control"
                value={filters.mes}
                onChange={e => setFilters(p => ({ ...p, mes: e.target.value }))}
                style={{ appearance: 'auto', backgroundColor: 'var(--surface-color)' }}
              >
                <option value="">Mes</option>
                {MESES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select
                className="form-control"
                value={filters.anio}
                onChange={e => setFilters(p => ({ ...p, anio: e.target.value }))}
                style={{ appearance: 'auto', backgroundColor: 'var(--surface-color)' }}
              >
                {ANIOS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
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
            <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>No se encontraron viajes disponibles.</p>
          </div>
        ) : (
          viajes.map(viaje => (
            <div key={viaje.IdViaje} className="card" style={{ borderLeft: '4px solid var(--blue-primary)' }}>
              {/* Info del viaje */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '4px', fontWeight: 700 }}>
                    {viaje.ruta?.origen?.Nombre} → {viaje.ruta?.destino?.Nombre}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
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
                <div style={{ width: '1px', background: 'var(--border)' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '2px' }}>Lugares</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{viaje.AsientosDisponibles} disp.</p>
                </div>
              </div>

              {/* Panel de solicitud */}
              {viaje.AsientosDisponibles === 0 ? (
                <div style={{ background: 'var(--danger-soft)', color: 'var(--danger-text)', padding: '12px', borderRadius: '12px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                  Viaje Completo
                </div>
              ) : requestData.viajeId === viaje.IdViaje ? (
                <div className="animate-up" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  {/* Lugares */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.65rem' }}>¿Cuántos lugares necesitas?</label>
                    <select
                      className="form-control"
                      value={requestData.asientosSolicitados}
                      onChange={e => {
                        const n = parseInt(e.target.value);
                        // Ajustar campos de invitados: n-1 campos extra (uno por lugar adicional)
                        const nuevosInvitados = Array.from({ length: n - 1 }, (_, i) => requestData.invitados[i] || '');
                        setRequestData(p => ({ ...p, asientosSolicitados: n, invitados: nuevosInvitados.length > 0 ? nuevosInvitados : [''] }));
                      }}
                      style={{ appearance: 'auto', backgroundColor: 'var(--surface-color)' }}
                    >
                      {Array.from({ length: viaje.AsientosDisponibles }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} lugar{n > 1 ? 'es' : ''} {n > 1 ? `(tú + ${n-1} invitado${n-1>1?'s':''})` : '(solo tú)'}</option>
                      ))}
                    </select>
                  </div>

                  {/* Invitados — un campo por cada lugar extra */}
                  {requestData.asientosSolicitados > 1 && (
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.65rem' }}>
                        Correos de tus {requestData.asientosSolicitados - 1} compañero(s)
                      </label>
                      {Array.from({ length: requestData.asientosSolicitados - 1 }, (_, idx) => (
                        <div key={idx} style={{ marginBottom: '8px' }}>
                          <input
                            type="email"
                            className="form-control"
                            placeholder={`Compañero ${idx + 1} — correo@colima.tecnm.mx`}
                            value={requestData.invitados[idx] || ''}
                            onChange={e => {
                              const nueva = [...requestData.invitados];
                              nueva[idx] = e.target.value;
                              setRequestData(p => ({ ...p, invitados: nueva }));
                            }}
                            style={{ fontSize: '0.85rem' }}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button type="button" onClick={cerrarSolicitud} className="btn btn-outline" style={{ padding: '12px', fontSize: '0.9rem' }}>Cancelar</button>
                    <button type="button" onClick={handleSolicitar} className="btn" style={{ padding: '12px', fontSize: '0.9rem' }}>Solicitar</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => abrirSolicitud(viaje)} className="btn" style={{ padding: '12px', fontSize: '0.9rem' }}>
                  Solicitar Viaje
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
