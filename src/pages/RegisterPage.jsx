import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Auth.css';

/**
 * Página de registro de nuevo usuario.
 *
 * Formulario controlado con cinco campos que refleja el esquema de la BD:
 * NombreCompleto, Correo, Telefono (opcional), Contrasena, Contrasena_confirmation.
 * Valida localmente que las contraseñas coincidan antes de enviar.
 * En éxito, llama a auth.register() y redirige al dashboard.
 *
 * @field {string} NombreCompleto           — Nombre y apellido del usuario
 * @field {string} Correo                   — Email institucional
 * @field {string} Telefono                 — Teléfono (opcional)
 * @field {string} Contrasena               — Contraseña (mín. 8 chars)
 * @field {string} Contrasena_confirmation  — Confirmación de contraseña
 */
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

  /** Actualiza el campo correspondiente en el estado al escribir */
  const handleChange = (e) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * Valida localmente y envía el formulario.
   * Muestra errores si las contraseñas no coinciden o si el servidor rechaza.
   */
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
    <div className="auth-screen animate-up" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <div className="auth-card">

        {/* Título de la sección */}
        <div className="text-center mb-6">
          <h1 className="auth-logo" style={{ fontSize: '2.2rem', letterSpacing: '-0.05em' }}>
            REGISTRO
          </h1>
          <p className="auth-subtitle">Únete a la nueva red de Carpool TecNM</p>
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
            <label className="form-label" htmlFor="NombreCompleto">Nombre Completo</label>
            <input
              type="text"
              id="NombreCompleto"
              name="NombreCompleto"
              className="form-control"
              placeholder="Juan Pérez"
              value={fields.NombreCompleto}
              onChange={handleChange}
              required
            />
          </div>

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
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="Telefono">Teléfono (Opcional)</label>
            <input
              type="tel"
              id="Telefono"
              name="Telefono"
              className="form-control"
              placeholder="312 000 0000"
              value={fields.Telefono}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="Contrasena">Contraseña</label>
            <input
              type="password"
              id="Contrasena"
              name="Contrasena"
              className="form-control"
              placeholder="Mín. 8 caracteres"
              value={fields.Contrasena}
              onChange={handleChange}
              minLength={8}
              required
            />
          </div>

          <div className="form-group mb-6">
            <label className="form-label" htmlFor="Contrasena_confirmation">Confirmar Contraseña</label>
            <input
              type="password"
              id="Contrasena_confirmation"
              name="Contrasena_confirmation"
              className="form-control"
              placeholder="Repite tu contraseña"
              value={fields.Contrasena_confirmation}
              onChange={handleChange}
              required
            />
          </div>

          <div className="btn-stack">
            <button type="submit" className="btn" id="btn-register" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'CREAR MI CUENTA'}
            </button>
            <Link to="/login" className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
              Ya tengo acceso
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
