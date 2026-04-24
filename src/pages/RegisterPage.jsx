import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Auth.css';

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fields, setFields] = useState({
    NombreCompleto: '',
    Correo: '',
    Telefono: '',
    Contrasena: '',
    Contrasena_confirmation: '',
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    if (fields.Contrasena !== fields.Contrasena_confirmation) {
      setErrors(['Las contraseñas no coinciden.']);
      return;
    }

    setLoading(true);
    try {
      await register(fields);
      navigate('/dashboard');
    } catch (err) {
      setErrors(err.messages || ['Error al crear la cuenta. Intenta de nuevo.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen animate-up" style={{ padding: '20px 0' }}>
      <div className="auth-card" style={{ maxWidth: '400px', margin: '0 auto' }}>

        <div className="text-center mb-8">
          <h1 className="auth-logo" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>ÚNETE</h1>
          <p className="auth-subtitle">Crea tu cuenta institucional</p>
        </div>

        {errors.length > 0 && (
          <div className="alert alert-error" style={{ marginBottom: '24px' }}>
            <ul className="error-list">
              {errors.map((msg, i) => <li key={i}>{msg}</li>)}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input type="text" name="NombreCompleto" className="form-control" placeholder="Ej. Pedro Picapiedra" value={fields.NombreCompleto} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Correo Institucional</label>
            <input type="email" name="Correo" className="form-control" placeholder="ejemplo@colima.tecnm.mx" value={fields.Correo} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Teléfono (WhatsApp)</label>
            <input type="tel" name="Telefono" className="form-control" placeholder="312 000 0000" value={fields.Telefono} onChange={handleChange} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input type="password" name="Contrasena" className="form-control" placeholder="••••••••" value={fields.Contrasena} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar</label>
              <input type="password" name="Contrasena_confirmation" className="form-control" placeholder="••••••••" value={fields.Contrasena_confirmation} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="btn" style={{ marginTop: '24px' }} disabled={loading}>
            {loading ? 'CREANDO CUENTA...' : 'REGISTRARME'}
          </button>
          
          <div className="text-center mt-6">
            <p className="auth-switch">
              ¿Ya tienes cuenta? <Link to="/login" style={{ fontWeight: 700, color: 'var(--blue-bright)' }}>Inicia Sesión</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
