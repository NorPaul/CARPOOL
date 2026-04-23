import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';

function VehiculosCreate() {
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    placa: '',
    color: ''
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('carpool_token');
      const res = await fetch('/api/vehiculos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al registrar el vehículo');
      }
      
      navigate('/viajes/nuevo'); // Return to viajs/nuevo
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <div style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Link to="/viajes/nuevo" style={{ color: 'var(--text-muted)', textDecoration: 'none', padding: '8px' }}>&larr; Volver</Link>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Registrar Vehículo</h2>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="card">
          <div className="form-group">
            <label className="form-label">Marca</label>
            <input type="text" name="marca" className="form-control" required value={formData.marca} onChange={handleChange} placeholder="Ej. Nissan" />
          </div>
          <div className="form-group">
            <label className="form-label">Modelo</label>
            <input type="text" name="modelo" className="form-control" required value={formData.modelo} onChange={handleChange} placeholder="Ej. Versa" />
          </div>
          <div className="form-group">
            <label className="form-label">Año</label>
            <input type="number" name="anio" className="form-control" required value={formData.anio} onChange={handleChange} min="1990" max={new Date().getFullYear() + 1} />
          </div>
          <div className="form-group">
            <label className="form-label">Placa</label>
            <input type="text" name="placa" className="form-control" required value={formData.placa} onChange={handleChange} placeholder="Ej. ABC-123-D" />
          </div>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Color</label>
            <input type="text" name="color" className="form-control" required value={formData.color} onChange={handleChange} placeholder="Ej. Plata" />
          </div>
          
          <button type="submit" className="btn">Guardar Vehículo</button>
        </form>
      </div>
    </Layout>
  );
}

export default VehiculosCreate;
