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
    // Poll every 5 seconds for new messages
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

  if (loading) return <Layout><p>Cargando chat...</p></Layout>;

  return (
    <Layout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '80vh', marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Link to="/viajes" style={{ color: 'var(--text-muted)', textDecoration: 'none', padding: '8px' }}>&larr; Volver</Link>
          <div>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Chat del Viaje</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {viaje?.ruta?.origen?.Nombre || 'Origen'} &rarr; {viaje?.ruta?.destino?.Nombre || 'Destino'}
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="card" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', padding: '16px' }}>
          {mensajes.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
              No hay mensajes aún. ¡Comienza a comunicarte para planear el viaje!
            </p>
          ) : (
            mensajes.map(msg => {
              const esMio = msg.IdRemitente === currentUser?.IdUsuario;
              return (
                <div key={msg.IdMensaje} style={{ display: 'flex', flexDirection: 'column', alignItems: esMio ? 'flex-end' : 'flex-start' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    {msg.remitente?.NombreCompleto || 'Usuario'}
                  </span>
                  <div style={{
                    background: esMio ? 'var(--blue-primary)' : 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: esMio ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    maxWidth: '85%',
                    fontSize: '0.95rem'
                  }}>
                    {msg.Contenido}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Send Message */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            required
            autoFocus
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn" style={{ width: 'auto', padding: '12px 20px' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default ChatPage;
