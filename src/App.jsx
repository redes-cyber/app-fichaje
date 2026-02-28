import React, { useState, useEffect } from 'react';
import { ClockControls } from './components/ClockControls.jsx';
import { HistoryLog } from './components/HistoryLog.jsx';
import { RegistrationForm } from './components/RegistrationForm.jsx';
import { useGeolocation } from './hooks/useGeolocation.js';
import { registrarEntrada, registrarSalida, obtenerRegistros } from './lib/sheets.js';
import './index.css';

function App() {
  const [sessions, setSessions] = useState([]);
  const [employeeName, setEmployeeName] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const { requestLocation, loading: geoLoading, error: geoError } = useGeolocation();

  useEffect(() => {
    const savedName = localStorage.getItem('employeeName');
    if (savedName) {
      setEmployeeName(savedName);
    }
    const openSession = localStorage.getItem('openSession');
    if (openSession) {
      try {
        setActiveSession(JSON.parse(openSession));
      } catch { }
    }
  }, []);

  // Cargamos el historial al identificarse el empleado
  useEffect(() => {
    if (employeeName) {
      cargarHistorial();
    }
  }, [employeeName]);

  const cargarHistorial = async () => {
    const data = await obtenerRegistros();
    setSessions(data);
  };

  const mostrarEstado = (msg, tipo = 'ok') => {
    setStatusMsg({ msg, tipo });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleEntrada = async () => {
    setLoading(true);
    try {
      const loc = await requestLocation();
      const now = new Date();
      const fechaStr = now.toLocaleDateString('es-ES');
      const horaStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Guardar sesión activa localmente
      const session = {
        empleado: employeeName,
        fecha: fechaStr,
        hora_entrada: horaStr,
        hora_entrada_iso: now.toISOString(),
        lat: loc?.lat,
        lng: loc?.lng,
      };
      setActiveSession(session);
      localStorage.setItem('openSession', JSON.stringify(session));

      // Enviar a Google Sheets
      await registrarEntrada({
        empleado: employeeName,
        fecha: fechaStr,
        hora_entrada: horaStr,
      });

      // Añadir al historial local de forma optimística
      setSessions(prev => [{
        empleado: employeeName,
        accion: 'Jornada',
        fecha: fechaStr,
        hora_entrada: horaStr,
        hora_salida: '',
        total_horas: '',
        _open: true,
      }, ...prev]);

      mostrarEstado('✅ Entrada fichada correctamente');
    } catch (err) {
      mostrarEstado('⚠️ ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSalida = async () => {
    setLoading(true);
    const currentSession = activeSession || JSON.parse(localStorage.getItem('openSession') || 'null');

    if (!currentSession) {
      mostrarEstado('⚠️ No hay una entrada activa registrada.', 'error');
      setLoading(false);
      return;
    }

    try {
      await requestLocation();
      const now = new Date();
      const entrada = new Date(currentSession.hora_entrada_iso);
      const diffMs = now - entrada;
      const totalHoras = (diffMs / 3600000).toFixed(2);
      const horaStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Enviar a Google Sheets
      await registrarSalida({
        empleado: employeeName,
        hora_salida: horaStr,
        total_horas: totalHoras,
      });

      // Actualizar historial local
      setSessions(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(s => s._open && s.empleado === employeeName);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], hora_salida: horaStr, total_horas: totalHoras, _open: false };
        }
        return updated;
      });

      setActiveSession(null);
      localStorage.removeItem('openSession');
      mostrarEstado('🔴 Salida fichada. Total: ' + totalHoras + ' horas');
    } catch (err) {
      mostrarEstado('⚠️ ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (name) => {
    setEmployeeName(name);
    localStorage.setItem('employeeName', name);
  };

  const handleChangeUser = () => {
    if (activeSession) {
      alert('Por favor ficha la Salida antes de cambiar de usuario.');
      return;
    }
    if (confirm('¿Cambiar de usuario?')) {
      setEmployeeName(null);
      setSessions([]);
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

            {statusMsg && (
              <div className={`status-msg ${statusMsg.tipo === 'error' ? 'status-error' : 'status-ok'}`}>
                {statusMsg.msg}
              </div>
            )}

            <ClockControls
              onEntrada={handleEntrada}
              onSalida={handleSalida}
              isClockedIn={isClockedIn}
              activeSession={activeSession}
              loading={loading || geoLoading}
              error={geoError}
            />

            <HistoryLog sessions={sessions} onRefresh={cargarHistorial} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
