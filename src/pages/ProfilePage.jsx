import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';

function ProfilePage() {
  const { user, logout } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('carpool_token');
        // Si no hay userId en la URL, usamos la ruta base para el perfil propio
        const url = userId ? `/api/perfil/${userId}` : '/api/perfil';
        
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          const errData = await res.json();
          setError(errData.message || 'No se pudo cargar el perfil');
        }
      } catch (err) {
        console.error('Error fetching profile', err);
        setError('Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleDeleteVehiculo = async (id) => {
    try {
      const token = localStorage.getItem('carpool_token');
      const res = await fetch(`/api/vehiculos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProfile(prev => ({
          ...prev,
          vehiculos: prev.vehiculos.filter(v => v.IdVehiculo !== id)
        }));
      }
    } catch (error) {
      console.error('Error deleting vehicle', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <Layout><div className="text-center" style={{padding:'40px'}}><p style={{ color: 'var(--text-muted)' }}>Cargando perfil...</p></div></Layout>;
  
  if (error || !profile) return (
    <Layout>
      <div className="card text-center" style={{marginTop:'40px'}}>
        <p style={{ color: 'var(--danger-text)' }}>{error || 'Perfil no disponible'}</p>
        <button onClick={() => navigate(-1)} className="btn btn-outline" style={{width:'auto', marginTop:'16px'}}>Volver</button>
      </div>
    </Layout>
  );

  const isOwnProfile = !userId || Number(userId) === user?.IdUsuario;
  const { usuario, calificacion, totalCalificaciones, vehiculos, resenas } = profile;

  return (
    <Layout>
      <div className="animate-up" style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          {!isOwnProfile && <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>&larr;</button>}
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{isOwnProfile ? 'Mi Perfil' : 'Perfil de Usuario'}</h2>
        </div>

        {/* Avatar & Info */}
        <div className="card text-center" style={{ padding: '32px 16px' }}>
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--blue-primary), #8b5cf6)',
            margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', fontWeight: 'bold', color: 'white',
            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)'
          }}>
            {usuario?.NombreCompleto?.charAt(0) || 'U'}
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '4px' }}>{usuario?.NombreCompleto}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>{usuario?.Correo}</p>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(251, 191, 36, 0.1)', padding: '10px 20px', borderRadius: '25px' }}>
            <span style={{ fontSize: '1.4rem' }}>⭐</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24' }}>{calificacion}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({totalCalificaciones} reseñas)</span>
          </div>

          {isOwnProfile && (
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Link to="/perfil/editar" className="btn btn-outline" style={{ width: 'auto', padding: '10px 20px' }}>
                Editar Perfil
              </Link>
              <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger-text)', width: 'auto', padding: '10px 24px' }}>
                Salir
              </button>
            </div>
          )}
        </div>

        {/* Vehículos */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Vehículos</h3>
          {isOwnProfile && (
            <Link to="/vehiculos/nuevo" style={{ color: 'var(--blue-bright)', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
              + AGREGAR
            </Link>
          )}
        </div>

        {!vehiculos || vehiculos.length === 0 ? (
          <div className="card text-center" style={{ padding: '24px' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: 0, fontSize: '0.9rem' }}>Sin vehículos registrados.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {vehiculos.map(veh => (
              <div key={veh.IdVehiculo} className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>{veh.Placas}</p>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{veh.Modelo}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Color {veh.Color}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800 }}>CAP.</p>
                      <p style={{ fontWeight: 800 }}>{veh.Capacidad}</p>
                    </div>
                    {isOwnProfile && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => { if(window.confirm('¿Eliminar vehículo?')) handleDeleteVehiculo(veh.IdVehiculo) }} 
                          className="btn-outline" 
                          style={{ padding: '8px 16px', fontSize: '0.75rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger-text)', fontWeight: 800, background: 'rgba(239, 68, 68, 0.05)' }}
                        >
                          BORRAR
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reseñas */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '32px', marginBottom: '16px' }}>Reseñas</h3>
        {!resenas || resenas.length === 0 ? (
          <div className="card text-center" style={{ padding: '24px' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>Aún no tiene reseñas.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {resenas.map(resena => (
              <div key={resena.IdCalificacion} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--blue-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {resena.emisor?.NombreCompleto?.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>{resena.emisor?.NombreCompleto}</p>
                      <div style={{ color: '#fbbf24', fontSize: '0.8rem' }}>
                        {'★'.repeat(resena.Estrellas)}{'☆'.repeat(5 - resena.Estrellas)}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(resena.FechaCreacion).toLocaleDateString()}</span>
                </div>
                <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-main)', opacity: 0.9 }}>
                  &quot;{resena.Comentario || 'Sin comentarios.'}&quot;
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ProfilePage;
