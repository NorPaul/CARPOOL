import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../lib/api';

const MESES = [
  { value: '', label: 'Todos los meses' },
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

const anioActual = new Date().getFullYear();
const ANIOS = [anioActual, anioActual - 1, anioActual - 2];

function GananciasPage() {
  const [data, setData] = useState({ total: 0, viajes: [] });
  const [loading, setLoading] = useState(true);
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAnio, setFiltroAnio] = useState(String(anioActual));
  const filtroFecha = filtroMes ? `${filtroAnio}-${filtroMes}` : '';

  useEffect(() => {
    fetchGanancias();
  }, []);

  const fetchGanancias = async () => {
    setLoading(true);
    try {
      const params = filtroFecha ? { fecha: filtroFecha } : {};
      const res = await api.get('/viajes/ganancias', { params });
      setData(res.data);
    } catch (err) {
      console.error('Error cargando ganancias', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchGanancias();
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <Layout>
      <div className="animate-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', padding: '8px' }}>
            &larr; Volver
          </Link>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Reporte de Ganancias</h2>
        </div>

        {/* Total Banner */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
            border: 'none',
            textAlign: 'center',
            padding: '32px',
            marginBottom: '24px',
          }}
        >
          <p
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '8px',
            }}
          >
            Total Acumulado
          </p>
          <p style={{ fontSize: '3rem', fontWeight: 800, color: '#10b981', margin: 0 }}>
            ${Number(data.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Filtro */}
        <form onSubmit={handleFilter} className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
          <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>Filtrar por período</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'center' }}>
            <select
              className="form-control"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              style={{ appearance: 'auto', backgroundColor: 'var(--surface-color)' }}
            >
              {MESES.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              className="form-control"
              value={filtroAnio}
              onChange={(e) => setFiltroAnio(e.target.value)}
              style={{ appearance: 'auto', backgroundColor: 'var(--surface-color)' }}
            >
              {ANIOS.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <button type="submit" className="btn" style={{ padding: '14px 16px', width: 'auto' }}>
              Aplicar
            </button>
          </div>
        </form>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Detalle de Ingresos</h3>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Cargando...</p>
        ) : !data.viajes || data.viajes.length === 0 ? (
          <div className="card text-center">
            <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>
              No hay registros de ganancias{filtroFecha ? ' para este período' : ''}.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {data.viajes.map((viaje) => {
              const pasajerosConfirmados = viaje.AsientosTotales - viaje.AsientosDisponibles;
              const ganancia = pasajerosConfirmados * Number(viaje.PrecioPorPasajero);

              return (
                <div
                  key={viaje.IdViaje}
                  className="card"
                  style={{ borderLeft: '4px solid #10b981', padding: '20px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: '0.65rem',
                          color: 'var(--text-muted)',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                        }}
                      >
                        Viaje #{viaje.IdViaje}
                      </p>
                      <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 700 }}>
                        {viaje.ruta?.origen?.Nombre} → {viaje.ruta?.destino?.Nombre}
                      </h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                        {formatDate(viaje.FechaSalida)}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', margin: '0 0 4px' }}>
                        ${ganancia.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      gap: '16px',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>👥 {pasajerosConfirmados} pasajero(s)</span>
                    <span>💵 ${Number(viaje.PrecioPorPasajero).toFixed(2)} c/u</span>
                    <Link
                      to={`/viajes/${viaje.IdViaje}/chat`}
                      style={{ color: 'var(--blue-bright)', marginLeft: 'auto', fontWeight: 600 }}
                    >
                      Ver chat →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default GananciasPage;
