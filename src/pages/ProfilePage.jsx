import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';

function ProfilePage() {
  const { user, logout } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('carpool_token');
        const url = userId ? `/api/perfil/${userId}` : '/api/perfil';
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <Layout><p style={{ color: 'var(--text-muted)' }}>Cargando perfil...</p></Layout>;
  if (!profile) return <Layout><p style={{ color: 'var(--text-muted)' }}>No se pudo cargar el perfil.</p></Layout>;

  const isOwnProfile = !userId || Number(userId) === user?.IdUsuario;

  return (
    <Layout>
      <div className="animate-up" style={{ marginTop: '10px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Perfil de Usuario</h2>

        {/* Avatar & Info */}
        <div className="card text-center" style={{ padding: '24px 16px' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--blue-primary), #8b5cf6)',
            margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 'bold', color: 'white'
          }}>
            {profile.usuario?.NombreCompleto?.charAt(0) || 'U'}
          </div>
          <h3 style={{ fontSize: '1.25rem' }}>{profile.usuario?.NombreCompleto}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{profile.usuario?.Correo}</p>
          
          {/* Calificación */}
          <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(251, 191, 36, 0.1)', padding: '8px 16px', borderRadius: '20px' }}>
            <span style={{ fontSize: '1.25rem' }}>⭐</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fbbf24' }}>{profile.calificacion}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>({profile.totalCalificaciones} reseñas)</span>
          </div>

          {isOwnProfile && (
            <button onClick={handleLogout} className="btn" style={{ marginTop: '20px', background: 'linear-gradient(135deg, var(--danger-red), var(--danger-dark))' }}>
              Cerrar Sesión
            </button>
          )}
        </div>

        {/* Vehículos */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Vehículos Registrados</h3>
          {isOwnProfile && (
            <Link to="/vehiculos/nuevo" className="btn btn-outline" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', borderRadius: '10px' }}>
              + Agregar Vehículo
            </Link>
          )}
        </div>

        {!profile.vehiculos || profile.vehiculos.length === 0 ? (
          <div className="card text-center" style={{ padding: '20px' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: 0, fontSize: '0.9rem' }}>Aún no tienes vehículos registrados.</p>
          </div>
        ) : (
          profile.vehiculos.map(veh => (
              <div key={veh.IdVehiculo} className="card" style={{ borderLeft: '4px solid var(--text-muted)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ marginBottom: '4px', fontSize: '1rem' }}>{veh.Modelo}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{veh.Color} | Placas: {veh.Placas}</p>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Capacidad:</span> <strong>{veh.Capacidad}</strong>
                  </div>
                </div>
              </div>
            ))
        )}

        {/* Reseñas */}
        <h3 style={{ fontSize: '1.1rem', marginTop: '24px', marginBottom: '12px' }}>Reseñas Recibidas</h3>
        {!profile.resenas || profile.resenas.length === 0 ? (
          <div className="card text-center">
            <p style={{ color: 'var(--text-muted)', marginBottom: 0 }}>Aún no tiene reseñas.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {profile.resenas.map(resena => (
              <div key={resena.IdCalificacion} className="card" style={{ borderLeft: '4px solid #fbbf24' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                      width: '36px', height: '36px', borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.875rem', fontWeight: 'bold', color: 'white', flexShrink: 0
                    }}>
                      {resena.emisor?.NombreCompleto?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '2px' }}>
                        {resena.emisor?.NombreCompleto || 'Usuario'}
                      </p>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[1,2,3,4,5].map(i => (
                          <span key={i} style={{ fontSize: '0.85rem' }}>{i <= resena.Estrellas ? '⭐' : '☆'}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(resena.FechaCreacion).toLocaleDateString()}
                  </span>
                </div>
                {resena.Comentario ? (
                  <p style={{ fontSize: '0.875rem', margin: 0, paddingLeft: '46px', fontStyle: 'italic' }}>
                    &quot;{resena.Comentario}&quot;
                  </p>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, paddingLeft: '46px', fontStyle: 'italic' }}>
                    Sin comentario
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {!isOwnProfile && (
          <div style={{ marginTop: '24px' }}>
            <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ textDecoration: 'none' }}>
              &larr; Volver atrás
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ProfilePage;
