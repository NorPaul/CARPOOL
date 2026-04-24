import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

function ProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState({
    NombreCompleto: '',
    Telefono: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setFields({
        NombreCompleto: user.NombreCompleto || '',
        Telefono: user.Telefono || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('carpool_token');
      const res = await fetch('/api/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fields)
      });

      if (res.ok) {
        setSuccess('¡Perfil actualizado con éxito!');
        // Actualizar el usuario en el localStorage para que se refleje en toda la app
        const updatedUser = { ...user, ...fields };
        localStorage.setItem('carpool_user', JSON.stringify(updatedUser));
        
        setTimeout(() => navigate('/perfil'), 1500);
      } else {
        const data = await res.json();
        setError(data.message);
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="animate-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Link to="/perfil" style={{ color: 'var(--text-muted)', textDecoration: 'none', padding: '8px' }}>&larr; Volver</Link>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Editar Perfil</h2>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="card">
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input 
              type="text" 
              name="NombreCompleto" 
              className="form-control" 
              value={fields.NombreCompleto} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group mb-8">
            <label className="form-label">Teléfono (WhatsApp)</label>
            <input 
              type="tel" 
              name="Telefono" 
              className="form-control" 
              placeholder="312 000 0000"
              value={fields.Telefono} 
              onChange={handleChange} 
            />
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default ProfileEdit;
