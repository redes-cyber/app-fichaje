import React, { useState, useEffect } from 'react';
import { registrarEntrada, registrarSalida, obtenerRegistros } from '../lib/sheets';
import { ClockControls } from './ClockControls';
import { HistoryLog } from './HistoryLog';
import { useGeolocation } from '../hooks/useGeolocation';
import { Clock } from 'lucide-react';

export function Fichaje({ session }) {
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [statusMsg, setStatusMsg] = useState(null);
    const { requestLocation, loading: geoLoading, error: geoError } = useGeolocation();

    const empleado = session.user.email;

    useEffect(() => {
        cargarHistorial();
        // Cargar sesión activa desde localStorage
        const savedSession = localStorage.getItem('openSession');
        if (savedSession) {
            try {
                setActiveSession(JSON.parse(savedSession));
            } catch (e) { }
        }
    }, [empleado]);

    const cargarHistorial = async () => {
        try {
            setFetching(true);
            const data = await obtenerRegistros(empleado);
            setSessions(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
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
            const horaStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

            const sessionData = {
                empleado,
                fecha: fechaStr,
                hora_entrada: horaStr,
                hora_entrada_iso: now.toISOString(),
                lat: loc?.lat || null,
                lng: loc?.lng || null
            };

            await registrarEntrada(sessionData);

            setActiveSession(sessionData);
            localStorage.setItem('openSession', JSON.stringify(sessionData));

            await cargarHistorial();
            mostrarEstado('✅ Entrada fichada correctamente');
        } catch (err) {
            mostrarEstado('⚠️ ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSalida = async () => {
        setLoading(true);
        try {
            const loc = await requestLocation();
            const now = new Date();
            const horaStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

            let totalHoras = '';
            if (activeSession) {
                const diffMs = now - new Date(activeSession.hora_entrada_iso);
                totalHoras = (diffMs / 3600000).toFixed(2);
            }

            await registrarSalida({
                empleado,
                hora_salida: horaStr,
                total_horas: totalHoras,
                lat: loc?.lat || null,
                lng: loc?.lng || null
            });

            setActiveSession(null);
            localStorage.removeItem('openSession');

            await cargarHistorial();
            mostrarEstado(`🔴 Salida fichada. Total: ${totalHoras} hrs`);
        } catch (err) {
            mostrarEstado('⚠️ ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tab-pane">
            <div className="glass-panel profile-panel">
                <h2 className="section-title">
                    <Clock className="section-icon" />
                    Fichar
                </h2>

                {statusMsg && (
                    <div className={`status-msg ${statusMsg.tipo === 'error' ? 'alert-error' : 'alert-success'} mb-4`}>
                        {statusMsg.msg}
                    </div>
                )}

                <ClockControls
                    onEntrada={handleEntrada}
                    onSalida={handleSalida}
                    isClockedIn={!!activeSession}
                    activeSession={activeSession}
                    loading={loading || geoLoading}
                    error={geoError}
                />
            </div>

            <div className="glass-panel mt-4 p-0 bg-transparent shadow-none">
                <HistoryLog sessions={sessions} onRefresh={cargarHistorial} />
            </div>
        </div>
    );
}
