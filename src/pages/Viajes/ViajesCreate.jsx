import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import Layout from '../../components/Layout';

registerLocale('es', es);

function ViajesCreate() {
  const [vehiculos, setVehiculos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    IdOrigen: '',
    IdDestino: '',
    fechaHora: '',
    IdVehiculo: '',
    asientos: 3,
    precio: 15,
    notas: ''
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('carpool_token');
        const [resVeh, resUbi] = await Promise.all([
          fetch('/api/vehiculos', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/ubicaciones', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (resVeh.ok && resUbi.ok) {
          const dataVeh = await resVeh.json();
          const dataUbi = await resUbi.json();
          setVehiculos(dataVeh);
          setUbicaciones(dataUbi);

          setFormData(prev => ({
            ...prev,
            IdVehiculo: dataVeh.length > 0 ? dataVeh[0].IdVehiculo : '',
            IdOrigen: dataUbi.length > 0 ? dataUbi[0].IdUbicacion : '',
            IdDestino: dataUbi.length > 1 ? dataUbi[1].IdUbicacion : (dataUbi.length > 0 ? dataUbi[0].IdUbicacion : '')
          }));
        }
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.IdOrigen === formData.IdDestino) {
      setError('El origen y el destino no pueden ser el mismo.');
      return;
    }

    try {
      const token = localStorage.getItem('carpool_token');
      const res = await fetch('/api/viajes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Error al publicar el viaje');
      
      navigate('/viajes');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Layout><p>Cargando...</p></Layout>;

  return (
    <Layout>
      <div style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', padding: '8px' }}>&larr; Volver</Link>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Publicar Viaje</h2>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {vehiculos.length === 0 ? (
          <div className="card text-center" style={{ borderLeft: '4px solid var(--blue-primary)' }}>
            <h3 style={{ marginBottom: '8px' }}>Vehículo Requerido</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>
              Para publicar un viaje, primero necesitas registrar el vehículo que vas a conducir.
            </p>
            <Link to="/vehiculos/nuevo" className="btn">Registrar Mi Vehículo</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card">
            <div className="form-group">
              <label className="form-label">Ubicación de Origen</label>
              <select name="IdOrigen" className="form-control" required value={formData.IdOrigen} onChange={handleChange} style={{ appearance: 'auto', backgroundColor: 'var(--surface-color)' }}>
                {ubicaciones.map(ubi => (
                  <option key={ubi.IdUbicacion} value={ubi.IdUbicacion}>{ubi.Nombre} ({ubi.Ciudad})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Ubicación de Destino</label>
              <select name="IdDestino" className="form-control" required value={formData.IdDestino} onChange={handleChange} style={{ appearance: 'auto', backgroundColor: 'var(--surface-color)' }}>
                {ubicaciones.map(ubi => (
                  <option key={ubi.IdUbicacion} value={ubi.IdUbicacion}>{ubi.Nombre} ({ubi.Ciudad})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">¿Cuándo es tu viaje?</label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setFormData(prev => ({
                    ...prev,
                    fechaHora: date ? date.toISOString() : ''
                  }));
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={1}
                dateFormat="d 'de' MMMM yyyy, HH:mm"
                locale="es"
                minDate={new Date()}
                placeholderText="Selecciona fecha y hora"
                required
                className="form-control"
                calendarClassName="carpool-calendar"
                wrapperClassName="datepicker-wrapper"
                popperPlacement="bottom-start"
                popperProps={{ strategy: 'fixed' }}
              />
            </div>
            
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Vehículo Seleccionado</label>
              <select name="IdVehiculo" className="form-control" required value={formData.IdVehiculo} onChange={handleChange} style={{ appearance: 'auto', backgroundColor: 'var(--surface-color)' }}>
                {vehiculos.map(veh => (
                  <option key={veh.IdVehiculo} value={veh.IdVehiculo}>{veh.Modelo} ({veh.Placas})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Asientos Libres</label>
                <input type="number" name="asientos" className="form-control" min="1" max="10" required value={formData.asientos} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Aporte Individual ($)</label>
                <input type="number" name="precio" className="form-control" min="0" step="0.5" required value={formData.precio} onChange={handleChange} style={{ backgroundColor: 'var(--bg-dark)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notas Adicionales (Opcional)</label>
              <textarea name="notas" className="form-control" value={formData.notas} onChange={handleChange} placeholder="Ej. Traigo música, no fumar..." rows="2" />
            </div>
            
            <button type="submit" className="btn">Confirmar y Publicar</button>
          </form>
        )}
      </div>
    </Layout>
  );
}

export default ViajesCreate;
