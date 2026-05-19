import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Auth.css';

// ── Reglas de validación ──────────────────────────────────────────────────────

const RULES = {
  NombreCompleto: (v) => {
    if (!v.trim()) return 'El nombre completo es requerido.';
    if (v.trim().length < 3) return 'Debe tener al menos 3 caracteres.';
    if (v.trim().length > 40) return 'No puede superar 40 caracteres.';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(v.trim())) return 'Solo se permiten letras y espacios.';
    return null;
  },
  Correo: (v) => {
    if (!v.trim()) return 'El correo es requerido.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Ingresa un correo válido.';
    if (!v.endsWith('@colima.tecnm.mx')) return 'Solo se permiten correos @colima.tecnm.mx.';
    return null;
  },
  Telefono: (v) => {
    if (!v) return null;
    const digits = v.replace(/\D/g, '');
    if (digits.length > 0 && digits.length !== 10) return 'Debe tener exactamente 10 dígitos.';
    return null;
  },
  Contrasena: (v) => {
    if (!v) return 'La contraseña es requerida.';
    if (v.length < 8) return 'Mínimo 8 caracteres.';
    if (!/[A-Z]/.test(v)) return 'Debe incluir al menos una mayúscula.';
    if (!/[a-z]/.test(v)) return 'Debe incluir al menos una minúscula.';
    if (!/[0-9]/.test(v)) return 'Debe incluir al menos un número.';
    return null;
  },
  Contrasena_confirmation: (v, fields) => {
    if (!v) return 'Confirma tu contraseña.';
    if (v !== fields.Contrasena) return 'Las contraseñas no coinciden.';
    return null;
  },
};

function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 1, label: 'Débil', color: '#ef4444' };
  if (score <= 4) return { level: 2, label: 'Regular', color: '#f59e0b' };
  return { level: 3, label: 'Fuerte', color: '#22c55e' };
}

// ── Componente ────────────────────────────────────────────────────────────────

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

  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordStrength = getPasswordStrength(fields.Contrasena);

  const validateField = useCallback((name, value) => {
    const rule = RULES[name];
    if (!rule) return null;
    return rule(value, fields);
  }, [fields]);

  const handleChange = (e) => {
    const { name } = e.target;
    let value = e.target.value;

    if (name === 'NombreCompleto') {
      value = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').slice(0, 40);
    }
    if (name === 'Telefono') {
      value = value.replace(/\D/g, '');
    }

    setFields((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = RULES[name]?.(value, { ...fields, [name]: value });
      setFieldErrors((prev) => ({ ...prev, [name]: error }));
    }

    // Revalidar confirmación si cambia la contraseña
    if (name === 'Contrasena' && touched.Contrasena_confirmation) {
      const confirmError = RULES.Contrasena_confirmation?.(fields.Contrasena_confirmation, { ...fields, Contrasena: value });
      setFieldErrors((prev) => ({ ...prev, Contrasena_confirmation: confirmError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateAll = () => {
    const errors = {};
    Object.keys(RULES).forEach((name) => {
      errors[name] = RULES[name](fields[name], fields);
    });
    setFieldErrors(errors);
    setTouched({ NombreCompleto: true, Correo: true, Telefono: true, Contrasena: true, Contrasena_confirmation: true });
    return Object.values(errors).every((e) => e === null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    if (!validateAll()) return;

    setLoading(true);
    try {
      await register(fields);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.messages?.[0] || 'Error al crear la cuenta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (name) =>
    `form-control${fieldErrors[name] ? ' input-error' : touched[name] && !fieldErrors[name] ? ' input-success' : ''}`;

  return (
    <div className="auth-screen animate-up" style={{ padding: '20px 0' }}>
      <div className="auth-card" style={{ maxWidth: '400px', margin: '0 auto' }}>

        <div className="text-center mb-8">
          <h1 className="auth-logo" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>ÚNETE</h1>
          <p className="auth-subtitle">Crea tu cuenta institucional</p>
        </div>

        {serverError && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>

          {/* Nombre Completo */}
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input
              type="text"
              name="NombreCompleto"
              className={inputClass('NombreCompleto')}
              placeholder="Ej. Pedro Picapiedra"
              value={fields.NombreCompleto}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="name"
            />
            {fieldErrors.NombreCompleto && (
              <span className="field-error">{fieldErrors.NombreCompleto}</span>
            )}
          </div>

          {/* Correo */}
          <div className="form-group">
            <label className="form-label">Correo Institucional</label>
            <input
              type="email"
              name="Correo"
              className={inputClass('Correo')}
              placeholder="ejemplo@colima.tecnm.mx"
              value={fields.Correo}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="email"
            />
            {fieldErrors.Correo && (
              <span className="field-error">{fieldErrors.Correo}</span>
            )}
          </div>

          {/* Teléfono */}
          <div className="form-group">
            <label className="form-label">
              Teléfono (WhatsApp)
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>— opcional</span>
            </label>
            <input
              type="tel"
              name="Telefono"
              className={inputClass('Telefono')}
              placeholder="3120000000"
              value={fields.Telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={10}
              autoComplete="tel"
            />
            {fieldErrors.Telefono && (
              <span className="field-error">{fieldErrors.Telefono}</span>
            )}
          </div>

          {/* Contraseñas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="Contrasena"
                  className={inputClass('Contrasena')}
                  placeholder="••••••••"
                  value={fields.Contrasena}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {fieldErrors.Contrasena && (
                <span className="field-error">{fieldErrors.Contrasena}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar</label>
              <div className="input-wrapper">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="Contrasena_confirmation"
                  className={inputClass('Contrasena_confirmation')}
                  placeholder="••••••••"
                  value={fields.Contrasena_confirmation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirm ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {fieldErrors.Contrasena_confirmation && (
                <span className="field-error">{fieldErrors.Contrasena_confirmation}</span>
              )}
            </div>
          </div>

          {/* Indicador de fuerza */}
          {fields.Contrasena && (
            <div className="password-strength">
              <div className="strength-bars">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="strength-bar"
                    style={{ background: passwordStrength.level >= n ? passwordStrength.color : 'var(--border)' }}
                  />
                ))}
              </div>
              <span className="strength-label" style={{ color: passwordStrength.color }}>
                {passwordStrength.label}
              </span>
            </div>
          )}

          <button
            type="submit"
            className="btn"
            style={{ marginTop: '24px' }}
            disabled={loading}
          >
            {loading ? 'CREANDO CUENTA...' : 'REGISTRARME'}
          </button>

          <div className="text-center mt-6">
            <p className="auth-switch">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" style={{ fontWeight: 700, color: 'var(--blue-bright)' }}>
                Inicia Sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
