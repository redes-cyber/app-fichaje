import React, { useState, useEffect } from 'react';
import { getItems, addItem, updateItem } from '../lib/storage';
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
        verificarSesionActiva();
    }, [empleado]);

    const verificarSesionActiva = async () => {
        try {
            const history = await getItems('fichajes', { empleado, is_open: true });
            if (history.length > 0) {
                // Ordenar por más reciente
                history.sort((a, b) => new Date(b.hora_entrada_iso) - new Date(a.hora_entrada_iso));
                setActiveSession(history[0]);
            } else {
                setActiveSession(null);
            }
        } catch (e) {
            console.warn("No active session error:", e.message);
        }
    };

    const cargarHistorial = async () => {
        try {
            setFetching(true);
            const data = await getItems('fichajes', { empleado });
            data.sort((a, b) => new Date(b.hora_entrada_iso) - new Date(a.hora_entrada_iso));
            setSessions(data.slice(0, 50));
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

            const newSession = await addItem('fichajes', {
                empleado,
                fecha: fechaStr,
                hora_entrada: horaStr,
                hora_entrada_iso: now.toISOString(),
                lat: loc?.lat?.toString() || null,
                lng: loc?.lng?.toString() || null,
                is_open: true
            });

            setActiveSession(newSession);
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
            if (activeSession && activeSession.hora_entrada_iso) {
                const diffMs = now - new Date(activeSession.hora_entrada_iso);
                totalHoras = (diffMs / 3600000).toFixed(2);
            }

            await updateItem('fichajes', activeSession.id, {
                hora_salida: horaStr,
                total_horas: totalHoras,
                lat_salida: loc?.lat?.toString() || null,
                lng_salida: loc?.lng?.toString() || null,
                is_open: false
            });

            setActiveSession(null);
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
