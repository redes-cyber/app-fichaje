import React, { useState, useEffect } from 'react';
import { getItems, addItem } from '../lib/storage';
import { Calendar, Send, Loader2, History } from 'lucide-react';

export function Vacations({ session }) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [requests, setRequests] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [comments, setComments] = useState('');
    const [msg, setMsg] = useState(null);

    const empleado = session.user.email;

    useEffect(() => {
        fetchRequests();
    }, [empleado]);

    const fetchRequests = async () => {
        try {
            setFetching(true);
            const data = await getItems('vacaciones', { empleado });
            data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setRequests(data);
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
            await addItem('vacaciones', {
                empleado,
                start_date: startDate,
                end_date: endDate,
                comments,
                status: 'Pendiente'
            });

            setMsg('Solicitud guardada localmente.');
            setStartDate('');
            setEndDate('');
            setComments('');
            fetchRequests();
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setLoading(false);
            setTimeout(() => setMsg(null), 4000);
        }
    };

    return (
        <div className="tab-pane">
            <div className="glass-panel">
                <h2 className="section-title">
                    <Calendar className="section-icon" />
                    Solicitar Vacaciones
                </h2>

                <form onSubmit={handleSubmit} className="vacation-form">
                    {msg && <div className="alert-success">{msg}</div>}

                    <div className="input-row">
                        <div className="input-group">
                            <label>Fecha Inicio</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Fecha Fin</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Comentarios (opcional)</label>
                        <textarea
                            placeholder="Ej: Viaje familiar..."
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className="input-field textarea-field"
                            rows={2}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? <Loader2 className="spin" size={20} /> : (
                            <>
                                <Send size={18} />
                                Enviar Solicitud
                            </>
                        )}
                    </button>
                </form>
            </div>

            <div className="glass-panel mt-4">
                <h3 className="subsection-title">
                    <History size={18} />
                    Mis Solicitudes
                </h3>
                {fetching ? (
                    <div className="loading-state">Cargando historial...</div>
                ) : requests.length === 0 ? (
                    <div className="empty-state">No hay solicitudes registradas aún.</div>
                ) : (
                    <div className="list-container">
                        {requests.map(req => (
                            <div key={req.id || Math.random()} className="list-item">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-semibold">{new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}</div>
                                        <div className="text-sm text-gray-500">{req.comments || 'Sin comentarios'}</div>
                                    </div>
                                    <span className={`status-badge status-${req.status.toLowerCase()}`}>
                                        {req.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
