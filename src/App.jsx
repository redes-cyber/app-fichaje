import React, { useState, useEffect } from 'react';
import { ClockControls } from './components/ClockControls.jsx';
import { HistoryLog } from './components/HistoryLog.jsx';
import { RegistrationForm } from './components/RegistrationForm.jsx';
import { useGeolocation } from './hooks/useGeolocation.js';
import { supabase } from './lib/supabase.js';
import './index.css';

function App() {
  const [records, setRecords] = useState([]);
  const [employeeName, setEmployeeName] = useState(null);
  const { requestLocation, loading, error: geoError } = useGeolocation();

  // Load from local storage and Supabase on mount
  useEffect(() => {
    const savedName = localStorage.getItem('employeeName');
    if (savedName) {
      setEmployeeName(savedName);
    }
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('time_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50); // Muestra los últimos 50 registros para no sobrecargar

      if (error) throw error;

      // Transform records to match UI expectations
      const formattedRecords = data.map(record => ({
        id: record.id,
        action: record.action,
        employeeName: record.employee_name,
        timestamp: record.timestamp,
        location: record.lat && record.lng ? {
          lat: record.lat,
          lng: record.lng,
          accuracy: record.accuracy
        } : null
      }));

      setRecords(formattedRecords);
    } catch (err) {
      console.error('Error fetching records from Supabase', err);
    }
  };

  const handleAction = async (action) => {
    try {
      const loc = await requestLocation();
      addRecord(action, loc);
    } catch (err) {
      // Si la ubicación falla, podemos guardar sin ella si lo deseamos, pero aquí requerimos ubicación.
      alert(`No se pudo obtener la ubicación para la acción: ${action}. ${err.message}`);
      // Comentar la siguiente linea si no es obligatorio tener ubicacion para guardar el registro.
      // addRecord(action, null); 
    }
  };

  const addRecord = async (action, location) => {
    // Generate optimistic UI record
    const tempId = crypto.randomUUID();
    const newRecord = {
      id: tempId,
      action,
      employeeName,
      timestamp: new Date().toISOString(),
      location
    };

    setRecords([newRecord, ...records]);

    // Insert to Supabase DB
    try {
      const { error } = await supabase
        .from('time_logs')
        .insert([{
          employee_name: employeeName,
          action,
          lat: location ? location.lat : null,
          lng: location ? location.lng : null,
          accuracy: location ? location.accuracy : null
        }]);

      if (error) throw error;
    } catch (err) {
      console.error('Error saving to Supabase', err);
      // Opcional: mostrar un mensaje de error al usuario si la nube falla
      alert('Error guardando en la nube. ' + err.message);
    }
  };

  const handleClear = () => {
    alert('Como Administrador, el borrado de la base de datos central debe hacerse desde el panel de control.');
  };

  const handleRegister = (name) => {
    setEmployeeName(name);
    localStorage.setItem('employeeName', name);
  };

  const handleChangeUser = () => {
    if (confirm('¿Estás seguro de que quieres cambiar de usuario? Deberás registrarte de nuevo.')) {
      setEmployeeName(null);
      localStorage.removeItem('employeeName');
    }
  };

  return (
    <div className="app-container">
      <div className="glass-panel main-panel">
        <header className="app-header">
          <h1>Limpieza Balear Mallorca</h1>
          <p className="app-subtitle">Sistema de Fichaje</p>
        </header>

        {!employeeName ? (
          <RegistrationForm onRegister={handleRegister} />
        ) : (
          <>
            <div className="user-welcome">
              <span>Hola, <strong>{employeeName}</strong></span>
              <button className="btn-text" onClick={handleChangeUser}>Cambiar usuario</button>
            </div>

            <ClockControls
              onAction={handleAction}
              loading={loading}
              error={geoError}
            />

            <HistoryLog
              records={records}
              onClear={handleClear}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
