import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';

function VehiculoCreate() {
  const navigate = useNavigate();
  const [fields, setFields] = useState({
    modelo: '',
    placas: '',
    color: '',
    capacidad: 4
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'capacidad') {
      if (value === '') { setFields(prev => ({ ...prev, capacidad: '' })); return; }
      const num = parseInt(value, 10);
      if (!isNaN(num)) setFields(prev => ({ ...prev, capacidad: Math.max(2, Math.min(num, 10)) }));
    } else {
      setFields(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cap = parseInt(fields.capacidad, 10);
    if (!fields.modelo.trim()) { setError('El modelo es requerido.'); setLoading(false); return; }
    if (!fields.placas.trim()) { setError('Las placas son requeridas.'); setLoading(false); return; }
    if (!fields.color.trim()) { setError('El color es requerido.'); setLoading(false); return; }
    if (isNaN(cap) || cap < 2 || cap > 10) { setError('La capacidad debe ser entre 2 y 10 pasajeros.'); setLoading(false); return; }

    try {
      const token = localStorage.getItem('carpool_token');
      const res = await fetch('/api/vehiculos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fields)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al registrar vehículo');
      }

      navigate('/viajes/nuevo');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="animate-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Link to="/perfil" style={{ color: 'var(--text-muted)', textDecoration: 'none', padding: '8px' }}>&larr; Volver</Link>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Registrar Vehículo</h2>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="card">
          <div className="form-group">
            <label className="form-label">Modelo / Marca</label>
            <input type="text" name="modelo" className="form-control" placeholder="Ej. Nissan Versa 2020" value={fields.modelo} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Placas</label>
            <input type="text" name="placas" className="form-control" placeholder="Ej. ABC-1234" value={fields.placas} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <input type="text" name="color" className="form-control" placeholder="Ej. Blanco" value={fields.color} onChange={handleChange} required />
          </div>
          <div className="form-group mb-6">
            <label className="form-label">Capacidad de pasajeros</label>
            <input type="number" name="capacidad" className="form-control" min="2" max="10" value={fields.capacidad} onChange={handleChange} required />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Mínimo 2, máximo 10 pasajeros (incluyendo conductor)</p>
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Registrando...' : 'REGISTRAR VEHÍCULO'}
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default VehiculoCreate;
