import React, { useState, useEffect } from 'react';
import { ClockControls } from './components/ClockControls.jsx';
import { HistoryLog } from './components/HistoryLog.jsx';
import { RegistrationForm } from './components/RegistrationForm.jsx';
import { useGeolocation } from './hooks/useGeolocation.js';
import { supabase } from './lib/supabase.js';
import './index.css';

function App() {
  const [sessions, setSessions] = useState([]);
  const [employeeName, setEmployeeName] = useState(null);
  const [activeSession, setActiveSession] = useState(null); // Sesión abierta actual
  const [loading, setLoading] = useState(false);
  const { requestLocation, loading: geoLoading, error: geoError } = useGeolocation();

  useEffect(() => {
    const savedName = localStorage.getItem('employeeName');
    if (savedName) {
      setEmployeeName(savedName);
    }
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('work_sessions')
        .select('*')
        .order('fecha', { ascending: false })
        .order('hora_entrada', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSessions(data || []);

      // Verificar si hay una sesión abierta localmente
      const openSession = localStorage.getItem('openSession');
      if (openSession) {
        setActiveSession(JSON.parse(openSession));
      }
    } catch (err) {
      console.error('Error cargando sesiones:', err);
    }
  };

  const handleEntrada = async () => {
    setLoading(true);
    try {
      const loc = await requestLocation();
      const now = new Date();

      const { data, error } = await supabase
        .from('work_sessions')
        .insert([{
          empleado: employeeName,
          accion: 'Jornada',
          fecha: now.toISOString().split('T')[0],
          hora_entrada: now.toISOString(),
          session_open: true,
          lat_entrada: loc?.lat || null,
          lng_entrada: loc?.lng || null,
        }])
        .select()
        .single();

      if (error) throw error;

      const session = { ...data };
      setActiveSession(session);
      localStorage.setItem('openSession', JSON.stringify(session));
      fetchSessions();
    } catch (err) {
      alert('Error al registrar entrada: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSalida = async () => {
    setLoading(true);
    try {
      const loc = await requestLocation();
      const now = new Date();
      const currentSession = activeSession || JSON.parse(localStorage.getItem('openSession'));

      if (!currentSession) {
        alert('No hay una entrada activa registrada.');
        setLoading(false);
        return;
      }

      // Calcular horas totales
      const entrada = new Date(currentSession.hora_entrada);
      const diffMs = now - entrada;
      const totalHoras = parseFloat((diffMs / 3600000).toFixed(2));

      const { error } = await supabase
        .from('work_sessions')
        .update({
          hora_salida: now.toISOString(),
          total_horas: totalHoras,
          session_open: false,
          lat_salida: loc?.lat || null,
          lng_salida: loc?.lng || null,
        })
        .eq('id', currentSession.id);

      if (error) throw error;

      setActiveSession(null);
      localStorage.removeItem('openSession');
      fetchSessions();
    } catch (err) {
      alert('Error al registrar salida: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (name) => {
    setEmployeeName(name);
    localStorage.setItem('employeeName', name);
    fetchSessions();
  };

  const handleChangeUser = () => {
    if (activeSession) {
      alert('Por favor ficha la Salida antes de cambiar de usuario.');
      return;
    }
    if (confirm('¿Estás seguro de que quieres cambiar de usuario?')) {
      setEmployeeName(null);
      localStorage.removeItem('employeeName');
    }
  };

  const isClockedIn = !!activeSession;

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
              onEntrada={handleEntrada}
              onSalida={handleSalida}
              isClockedIn={isClockedIn}
              activeSession={activeSession}
              loading={loading || geoLoading}
              error={geoError}
            />

            <HistoryLog
              sessions={sessions}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
