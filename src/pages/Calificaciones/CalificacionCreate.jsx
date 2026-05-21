import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';

function CalificacionCreate() {
  const { viajeId, usuarioId } = useParams();
  const navigate = useNavigate();
  const [evaluado, setEvaluado] = useState(null);
  const [fields, setFields] = useState({ estrellas: 5, comentario: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    const fetchEvaluado = async () => {
      try {
        const token = localStorage.getItem('carpool_token');
        const res = await fetch(`/api/perfil/${usuarioId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEvaluado(data.usuario);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluado();
  }, [usuarioId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('carpool_token');
      const res = await fetch(`/api/calificaciones/${viajeId}/${usuarioId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fields)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al enviar calificación');
      }

      navigate('/viajes');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) return <Layout><p style={{ color: 'var(--text-muted)' }}>Cargando datos del usuario...</p></Layout>;

  return (
    <Layout>
      <div className="animate-up">
        <header style={{ marginBottom: '32px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Feedback del Viaje</p>
          <h1 className="text-gradient" style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Calificar Experiencia</h1>
        </header>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="card" style={{ padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ 
              width: '80px', height: '80px', background: 'var(--blue-deep)', border: '4px solid rgba(37, 99, 235, 0.1)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{evaluado?.NombreCompleto?.charAt(0)}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calificando a</p>
            <h3 style={{ fontSize: '1.5rem', margin: '4px 0' }}>{evaluado?.NombreCompleto}</h3>
          </div>

          <div className="form-group" style={{ textAlign: 'center' }}>
            <label className="form-label" style={{ fontSize: '1rem', marginBottom: '24px' }}>¿Cómo calificarías el viaje?</label>
            <div style={{ 
              display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px'
            }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span 
                  key={star} 
                  style={{ 
                    cursor: 'pointer', fontSize: '2.5rem', transition: 'all 0.2s ease',
                    color: star <= (hoveredStar || fields.estrellas) ? '#fbbf24' : '#334155',
                    transform: star === hoveredStar ? 'scale(1.2)' : 'scale(1)'
                  }}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setFields(prev => ({ ...prev, estrellas: star }))}
                >
                  {star <= (hoveredStar || fields.estrellas) ? '★' : '★'}
                </span>
              ))}
            </div>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fbbf24', height: '1.2rem' }}>
              {fields.estrellas === 5 && '¡Excelente viaje!'}
              {fields.estrellas === 4 && 'Muy buena experiencia'}
              {fields.estrellas === 3 && 'Fue un viaje normal'}
              {fields.estrellas === 2 && 'Podría mejorar'}
              {fields.estrellas === 1 && 'No fue una buena experiencia'}
            </p>
          </div>

          <div className="form-group" style={{ marginTop: '40px' }}>
            <label className="form-label">Comentarios (Opcional)</label>
            <textarea 
              className="form-control" 
              rows="4" 
              placeholder="Cuéntanos más sobre tu experiencia..." 
              style={{ resize: 'none' }}
              value={fields.comentario} 
              onChange={(e) => setFields(prev => ({ ...prev, comentario: e.target.value }))}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              * Tu opinión ayuda a mantener segura la comunidad.
            </p>
          </div>

          <div style={{ marginTop: '40px' }}>
            <button type="submit" className="btn" disabled={submitting}>{submitting ? 'ENVIANDO...' : 'ENVIAR CALIFICACIÓN'}</button>
            <Link to="/viajes" className="btn btn-outline" style={{ marginTop: '12px', border: 'none', color: 'var(--text-muted)' }}>Omitir por ahora</Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default CalificacionCreate;
