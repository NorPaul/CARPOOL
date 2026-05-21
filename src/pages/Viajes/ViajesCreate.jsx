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

          const firstVeh = dataVeh[0];
          const defaultAsientos = firstVeh ? Math.min(3, firstVeh.Capacidad - 1) : 3;
          setFormData(prev => ({
            ...prev,
            IdVehiculo: firstVeh ? firstVeh.IdVehiculo : '',
            asientos: defaultAsientos,
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
    if (name === 'IdVehiculo') {
      const veh = vehiculos.find(v => String(v.IdVehiculo) === String(value));
      const max = veh ? veh.Capacidad - 1 : 10;
      setFormData(prev => ({
        ...prev,
        IdVehiculo: value,
        asientos: Math.min(Number(prev.asientos), max)
      }));
    } else if (name === 'asientos') {
      const veh = vehiculos.find(v => String(v.IdVehiculo) === String(formData.IdVehiculo));
      const max = veh ? veh.Capacidad - 1 : 10;
      if (value === '') {
        setFormData(prev => ({ ...prev, asientos: '' }));
      } else {
        const num = parseInt(value, 10);
        if (!isNaN(num)) setFormData(prev => ({ ...prev, asientos: Math.max(1, Math.min(num, max)) }));
      }
    } else if (name === 'precio') {
      if (value === '') {
        setFormData(prev => ({ ...prev, precio: '' }));
      } else {
        const num = parseFloat(value);
        if (!isNaN(num)) setFormData(prev => ({ ...prev, precio: Math.max(0, Math.min(num, 9999)) }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.IdOrigen) { setError('Debes seleccionar el origen.'); return; }
    if (!formData.IdDestino) { setError('Debes seleccionar el destino.'); return; }
    if (formData.IdOrigen === formData.IdDestino) { setError('El origen y el destino no pueden ser el mismo.'); return; }
    if (!formData.fechaHora) { setError('Debes seleccionar una fecha y hora para el viaje.'); return; }
    if (new Date(formData.fechaHora) <= new Date()) { setError('La fecha y hora de salida deben ser en el futuro. Por favor selecciona un horario válido.'); return; }
    if (!formData.IdVehiculo) { setError('Debes seleccionar un vehículo.'); return; }
    const vehSel = vehiculos.find(v => String(v.IdVehiculo) === String(formData.IdVehiculo));
    const maxSel = vehSel ? vehSel.Capacidad - 1 : 10;
    const asientosNum = parseInt(formData.asientos, 10);
    if (isNaN(asientosNum) || asientosNum < 1) { setError('El número de asientos debe ser al menos 1.'); return; }
    if (asientosNum > maxSel) { setError(`El vehículo tiene ${vehSel.Capacidad} asientos. Máximo ${maxSel} para pasajeros.`); return; }
    const precioNum = parseFloat(formData.precio);
    if (isNaN(precioNum) || precioNum < 0) { setError('El aporte individual no puede ser negativo.'); return; }
    if (precioNum > 9999) { setError('El aporte individual no puede superar $9,999.'); return; }

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

  const vehiculoSeleccionado = vehiculos.find(v => String(v.IdVehiculo) === String(formData.IdVehiculo));
  const maxAsientos = vehiculoSeleccionado ? vehiculoSeleccionado.Capacidad - 1 : 10;

  const filterFutureTime = (time) => time.getTime() > Date.now() + 5 * 60 * 1000;

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
                filterTime={filterFutureTime}
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
                <input type="number" name="asientos" className="form-control" min="1" max={maxAsientos} required value={formData.asientos} onChange={handleChange} />
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Máx. {maxAsientos} {vehiculoSeleccionado ? `(vehículo de ${vehiculoSeleccionado.Capacidad} asientos)` : ''}
                </p>
              </div>
              <div className="form-group">
                <label className="form-label">Aporte Individual ($)</label>
                <input type="number" name="precio" className="form-control" min="0" max="9999" step="0.5" required value={formData.precio} onChange={handleChange} style={{ backgroundColor: 'var(--bg-dark)' }} />
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Máx. $9,999</p>
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
