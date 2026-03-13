import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertTriangle, Send, Loader2 } from 'lucide-react';

const INCIDENT_TYPES = [
    'Retraso',
    'Ausencia por Enfermedad',
    'Problema en Cliente',
    'Falta de Material',
    'Otro'
];

export function Incidents({ session }) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [incidents, setIncidents] = useState([]);
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        fetchIncidents();
    }, [session]);

    const fetchIncidents = async () => {
        try {
            setFetching(true);
            const { data, error } = await supabase
                .from('incidencias')
                .select('*')
                .eq('user_id', session.user.id)
                .order('timestamp', { ascending: false });

            if (error) throw error;
            setIncidents(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMsg(null);

        if (!type || !description) {
            setError('Por favor, selecciona un tipo y describe la incidencia.');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.from('incidencias').insert([
                {
                    user_id: session.user.id,
                    type: type,
                    description: description,
                    timestamp: new Date().toISOString()
                }
            ]);

            if (error) throw error;

            setMsg('Incidencia reportada correctamente.');
            setType('');
            setDescription('');
            fetchIncidents();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setTimeout(() => setMsg(null), 4000);
        }
    };

    const formatDateTime = (iso) => {
        return new Date(iso).toLocaleString('es-ES', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const getIncidentIcon = (type) => {
        return <AlertTriangle size={18} className="incident-icon-small" />;
    };

    return (
        <div className="tab-pane">
            <div className="glass-panel">
                <h2 className="section-title">
                    <AlertTriangle className="section-icon" />
                    Reportar Incidencia
                </h2>

                <form onSubmit={handleSubmit} className="incident-form">
                    {error && <div className="alert-error">{error}</div>}
                    {msg && <div className="alert-success">{msg}</div>}

                    <div className="input-group">
                        <label>Tipo de Incidencia</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="input-field select-field"
                            required
                        >
                            <option value="" disabled>Selecciona el tipo</option>
                            {INCIDENT_TYPES.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Descripción detallada</label>
                        <textarea
                            placeholder="Explica qué ha ocurrido con claridad..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="input-field textarea-field"
                            rows={4}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? <Loader2 className="spin" size={20} /> : (
                            <>
                                <Send size={18} />
                                Enviar Reporte
                            </>
                        )}
                    </button>
                </form>
            </div>

            <div className="glass-panel mt-4">
                <h3 className="subsection-title">Historial de Incidencias</h3>
                {fetching ? (
                    <div className="loading-state">Cargando...</div>
                ) : incidents.length === 0 ? (
                    <div className="empty-state">No ha reportado incidencias.</div>
                ) : (
                    <div className="list-container">
                        {incidents.map(inc => (
                            <div key={inc.id} className="list-item">
                                <div className="list-item-header">
                                    <div className="list-item-title-with-icon">
                                        {getIncidentIcon(inc.type)}
                                        <span className="font-semibold">{inc.type}</span>
                                    </div>
                                </div>
                                <p className="list-item-desc">{inc.description}</p>
                                <div className="list-item-meta">
                                    Reportado: {formatDateTime(inc.timestamp)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
