import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';

function ChatPage() {
  const { viajeId } = useParams();
  const [viaje, setViaje] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('carpool_user') || '{}');

  const fetchChat = async () => {
    try {
      const token = localStorage.getItem('carpool_token');
      const res = await fetch(`/api/chat/${viajeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setViaje(data.viaje);
        setMensajes(data.mensajes);
      }
    } catch (error) {
      console.error('Error fetching chat', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, [viajeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('carpool_token');
      const res = await fetch(`/api/chat/${viajeId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ contenido: newMessage })
      });
      if (res.ok) {
        const msg = await res.json();
        setMensajes(prev => [...prev, msg]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  if (loading) return <Layout><div className="text-center" style={{padding:'40px'}}><p style={{color:'var(--text-muted)'}}>Abriendo canal de comunicación...</p></div></Layout>;

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '82vh' }}>
        
        {/* Header con Info del Viaje */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Link to="/viajes" style={{ color: 'var(--text-muted)', textDecoration: 'none', padding: '8px', fontSize: '1.2rem' }}>&larr;</Link>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>{viaje?.ruta?.origen?.Nombre} → {viaje?.ruta?.destino?.Nombre}</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--blue-bright)', fontWeight: 600 }}>{viaje?.conductor?.NombreCompleto} (Conductor)</p>
          </div>
        </div>

        {/* Lista de Pasajeros (Mini-pills) */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '8px', scrollbarWidth: 'none' }}>
          {viaje?.pasajeros?.map(p => (
            <span key={p.IdUsuario} style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', whiteSpace: 'nowrap', border: '1px solid var(--border)' }}>
              👤 {p.NombreCompleto.split(' ')[0]}
            </span>
          ))}
          {viaje?.invitados?.map((inv, idx) => (
            <span key={idx} style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--accent-vivid)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', whiteSpace: 'nowrap', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
              👥 Invitado
            </span>
          ))}
        </div>

        {/* Área de Mensajes */}
        <div className="card" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px', padding: '20px', background: 'rgba(2, 6, 23, 0.5)' }}>
          {mensajes.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto', fontSize: '0.9rem', maxWidth: '200px' }}>
              No hay mensajes aún. ¡Di hola para coordinar el punto de encuentro!
            </p>
          ) : (
            mensajes.map(msg => {
              const esMio = msg.IdRemitente === currentUser?.IdUsuario;
              return (
                <div key={msg.IdMensaje} style={{ display: 'flex', flexDirection: 'column', alignItems: esMio ? 'flex-end' : 'flex-start' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                    {esMio ? 'Tú' : msg.remitente?.NombreCompleto?.split(' ')[0]}
                  </span>
                  <div style={{
                    background: esMio ? 'linear-gradient(135deg, var(--blue-primary), var(--blue-deep))' : 'var(--surface-elevated)',
                    color: '#fff',
                    padding: '10px 14px',
                    borderRadius: esMio ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    maxWidth: '85%',
                    fontSize: '0.95rem',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}>
                    {msg.Contenido}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de Mensaje */}
        {viaje?.IdEstado < 3 ? (
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', background: 'var(--surface-color)', padding: '4px', borderRadius: '20px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Escribe un mensaje..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              required
              style={{ flex: 1, background: 'transparent', border: 'none', boxShadow: 'none' }}
            />
            <button type="submit" className="btn" style={{ width: '50px', height: '50px', borderRadius: '50%', padding: 0 }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px', background: 'var(--danger-soft)', borderRadius: '16px', color: 'var(--danger-text)', fontSize: '0.85rem', fontWeight: 600 }}>
            El chat está cerrado. El viaje ha finalizado.
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ChatPage;
