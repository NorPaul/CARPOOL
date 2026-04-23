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

  useEffect(() => {
    const fetchEvaluado = async () => {
      try {
        const token = localStorage.getItem('carpool_token');
        const res = await fetch(`/api/profile/${usuarioId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEvaluado(data.user);
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

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Layout><p style={{ color: 'var(--text-muted)' }}>Cargando...</p></Layout>;

  return (
    <Layout>
      <div className="animate-up">
        <h1 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '24px' }}>Calificar Experiencia</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card text-center" style={{ marginBottom: '24px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--blue-deep)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
            {evaluado?.NombreCompleto?.charAt(0)}
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Calificando a:</p>
          <h3 style={{ margin: 0 }}>{evaluado?.NombreCompleto}</h3>
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: '32px' }}>
          <div className="form-group" style={{ textAlign: 'center' }}>
            <label className="form-label" style={{ fontSize: '1rem', marginBottom: '20px' }}>¿Cómo calificarías el viaje?</label>
            <div style={{ fontSize: '2rem', display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span 
                  key={star} 
                  style={{ cursor: 'pointer', color: star <= fields.estrellas ? '#fbbf24' : 'var(--text-muted)' }}
                  onClick={() => setFields(prev => ({ ...prev, estrellas: star }))}
                >
                  {star <= fields.estrellas ? '★' : '☆'}
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Comentario (Opcional)</label>
            <textarea 
              className="form-control" 
              rows="4" 
              placeholder="Escribe algo sobre tu experiencia..." 
              value={fields.comentario} 
              onChange={(e) => setFields(prev => ({ ...prev, comentario: e.target.value }))}
            />
          </div>

          <button type="submit" className="btn">ENVIAR CALIFICACIÓN</button>
        </form>
      </div>
    </Layout>
  );
}

export default CalificacionCreate;
