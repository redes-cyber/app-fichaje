import React, { useState, useEffect } from 'react';
import { getItems, addItem } from '../lib/storage';
import { AlertTriangle, Send, Loader2, History } from 'lucide-react';

export function Incidents({ session }) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [incidents, setIncidents] = useState([]);
    const [type, setType] = useState('Retraso');
    const [description, setDescription] = useState('');
    const [msg, setMsg] = useState(null);

    const empleado = session.user.email;

    useEffect(() => {
        fetchIncidents();
    }, [empleado]);

    const fetchIncidents = async () => {
        try {
            setFetching(true);
            const data = await getItems('incidencias', { empleado });
            data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setIncidents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);

        try {
            const now = new Date();
            await addItem('incidencias', {
                empleado,
                incident_type: type,
                description,
                timestamp: now.toISOString()
            });

            setMsg('Incidencia reportada correctamente.');
            setDescription('');
            fetchIncidents();
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setLoading(false);
            setTimeout(() => setMsg(null), 4000);
        }
    };

    const incidentTypes = [
        'Retraso',
        'Enfermedad',
        'Problema con Cliente',
        'Falta de Material',
        'Avería Maquinaria',
        'Otro'
    ];

    return (
        <div className="tab-pane">
            <div className="glass-panel">
                <h2 className="section-title">
                    <AlertTriangle className="section-icon" />
                    Reportar Incidencia
                </h2>

                <form onSubmit={handleSubmit} className="incident-form">
                    {msg && <div className="alert-success">{msg}</div>}

                    <div className="input-group">
                        <label>Tipo de Incidencia</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="input-field select-field"
                        >
                            {incidentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Descripción Detallada</label>
                        <textarea
                            placeholder="Explique lo ocurrido..."
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
                <h3 className="subsection-title">
                    <History size={18} />
                    Historial de Incidencias
                </h3>
                {fetching ? (
                    <div className="loading-state">Cargando...</div>
                ) : incidents.length === 0 ? (
                    <div className="empty-state">No hay incidencias reportadas.</div>
                ) : (
                    <div className="list-container">
                        {incidents.map(inc => (
                            <div key={inc.id || Math.random()} className="list-item">
                                <div className="flex justify-between items-start">
                                    <div className="font-semibold text-red-500">{inc.incident_type}</div>
                                    <div className="text-xs text-gray-400">{new Date(inc.timestamp || inc.created_at).toLocaleString()}</div>
                                </div>
                                <p className="text-sm mt-1">{inc.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
