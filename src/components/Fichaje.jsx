import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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

    useEffect(() => {
        cargarHistorial();
        checkActiveSession();
    }, [session]);

    const cargarHistorial = async () => {
        try {
            setFetching(true);
            const { data, error } = await supabase
                .from('fichajes')
                .select('*')
                .eq('user_id', session.user.id)
                .order('timestamp', { ascending: false })
                .limit(50);

            if (error) throw error;

            // Transform records logic
            // Fichajes are events. We need to pair Entrada and Salida.
            // But for simplicity of migration and since we just need history, let's group them or just list them.
            // Actually, since the UI expects 'sessions' with hora_entrada, hora_salida, let's format it.

            const formattedSessions = [];
            let currentSession = null;

            const reversedData = [...(data || [])].reverse(); // oldest first to pair

            reversedData.forEach(record => {
                if (record.action === 'Entrada') {
                    currentSession = {
                        id: record.id,
                        empleado: session.user.email,
                        fecha: new Date(record.timestamp).toLocaleDateString('es-ES'),
                        hora_entrada: new Date(record.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                        hora_entrada_iso: record.timestamp,
                        hora_salida: '',
                        total_horas: '',
                        _open: true
                    };
                    formattedSessions.push(currentSession);
                } else if (record.action === 'Salida') {
                    // Find last open session
                    const lastOpen = [...formattedSessions].reverse().find(s => s._open);
                    if (lastOpen) {
                        lastOpen.hora_salida = new Date(record.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                        lastOpen._open = false;
                        const diffMs = new Date(record.timestamp) - new Date(lastOpen.hora_entrada_iso);
                        lastOpen.total_horas = (diffMs / 3600000).toFixed(2);
                    } else {
                        // Salida without entrada
                        formattedSessions.push({
                            id: record.id,
                            empleado: session.user.email,
                            fecha: new Date(record.timestamp).toLocaleDateString('es-ES'),
                            hora_entrada: '—',
                            hora_salida: new Date(record.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                            total_horas: '—',
                            _open: false
                        });
                    }
                }
            });

            setSessions(formattedSessions.reverse()); // newest first
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const checkActiveSession = async () => {
        // Check if the last record was an Entrada
        try {
            const { data, error } = await supabase
                .from('fichajes')
                .select('*')
                .eq('user_id', session.user.id)
                .order('timestamp', { ascending: false })
                .limit(1);

            if (data && data.length > 0 && data[0].action === 'Entrada') {
                setActiveSession({
                    hora_entrada: data[0].timestamp,
                    hora_entrada_iso: data[0].timestamp
                });
            } else {
                setActiveSession(null);
            }
        } catch (e) { }
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

            const { error } = await supabase.from('fichajes').insert([{
                user_id: session.user.id,
                action: 'Entrada',
                lat: loc?.lat || null,
                lng: loc?.lng || null,
                timestamp: now.toISOString()
            }]);

            if (error) throw error;

            await cargarHistorial();
            await checkActiveSession();
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

            const { error } = await supabase.from('fichajes').insert([{
                user_id: session.user.id,
                action: 'Salida',
                lat: loc?.lat || null,
                lng: loc?.lng || null,
                timestamp: now.toISOString()
            }]);

            if (error) throw error;

            let totalHoras = '';
            if (activeSession) {
                const diffMs = now - new Date(activeSession.hora_entrada_iso);
                totalHoras = (diffMs / 3600000).toFixed(2);
            }

            await cargarHistorial();
            await checkActiveSession();

            mostrarEstado(`🔴 Salida fichada. ${totalHoras ? `Total: ${totalHoras} hrs` : ''}`);
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
