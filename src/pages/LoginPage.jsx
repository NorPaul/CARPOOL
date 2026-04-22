import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Auth.css';

/**
 * Página de inicio de sesión.
 *
 * Gestiona un formulario controlado con dos campos (Correo, Contrasena).
 * Al enviar, llama a auth.login(); si tiene éxito redirige al dashboard.
 * Si hay errores de validación los muestra en un bloque de alerta.
 *
 * Campos del formulario:
 * @field {string} Correo        — Email institucional (@colima.tecnm.mx)
 * @field {string} Contrasena    — Contraseña del usuario
 */
function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [fields, setFields] = useState({ Correo: '', Contrasena: '' });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  /** Actualiza el campo del estado al escribir en cualquier input */
  const handleChange = (e) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * Maneja el submit del formulario.
   * Previene recarga, invoca login() y redirige si es exitoso.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      await login(fields);
      navigate('/dashboard');
    } catch (err) {
      setErrors(err.messages || ['Credenciales incorrectas. Intenta de nuevo.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen animate-up">
      <div className="auth-card">

        {/* Logo y subtítulo */}
        <div className="text-center mb-6">
          <h1 className="auth-logo">CARPOOL</h1>
          <p className="auth-subtitle">TECNM CAMPUS COLIMA</p>
        </div>

        {/* Bloque de errores */}
        {errors.length > 0 && (
          <div className="alert alert-error" role="alert">
            <ul className="error-list">
              {errors.map((msg, i) => <li key={i}>{msg}</li>)}
            </ul>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} noValidate>

          <div className="form-group">
            <label className="form-label" htmlFor="Correo">Correo Institucional</label>
            <input
              type="email"
              id="Correo"
              name="Correo"
              className="form-control"
              placeholder="usuario@colima.tecnm.mx"
              value={fields.Correo}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group mb-6">
            <label className="form-label" htmlFor="Contrasena">Contraseña</label>
            <input
              type="password"
              id="Contrasena"
              name="Contrasena"
              className="form-control"
              placeholder="••••••••"
              value={fields.Contrasena}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn" id="btn-login" disabled={loading}>
            {loading ? 'Verificando...' : 'INICIAR SESIÓN'}
          </button>
        </form>

        {/* Link a registro */}
        <div className="text-center mt-4">
          <p className="auth-switch">
            ¿Eres nuevo aquí?{' '}
            <Link to="/register">Crea una cuenta</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;
