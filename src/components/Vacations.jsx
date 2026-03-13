import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar as CalendarIcon, Loader2, Send } from 'lucide-react';

export function Vacations({ session }) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [vacations, setVacations] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [comments, setComments] = useState('');
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        fetchVacations();
    }, [session]);

    const fetchVacations = async () => {
        try {
            setFetching(true);
            const { data, error } = await supabase
                .from('vacaciones')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVacations(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const currentYear = new Date().getFullYear();
    const minDate = `${currentYear}-01-01`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMsg(null);

        if (new Date(startDate) > new Date(endDate)) {
            setError('La fecha de fin no puede ser anterior a la de inicio');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.from('vacaciones').insert([
                {
                    user_id: session.user.id,
                    start_date: startDate,
                    end_date: endDate,
                    comments: comments || null,
                }
            ]);

            if (error) throw error;

            setMsg('Solicitud de vacaciones enviada correctamente.');
            setStartDate('');
            setEndDate('');
            setComments('');
            fetchVacations();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setTimeout(() => setMsg(null), 4000);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Aprobado': return <span className="status-badge status-aprobado">Aprobado</span>;
            case 'Rechazado': return <span className="status-badge status-rechazado">Rechazado</span>;
            default: return <span className="status-badge status-pendiente">Pendiente</span>;
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('es-ES');
    };

    return (
        <div className="tab-pane">
            <div className="glass-panel">
                <h2 className="section-title">
                    <CalendarIcon className="section-icon" />
                    Mis Vacaciones
                </h2>

                <form onSubmit={handleSubmit} className="vacation-form">
                    {error && <div className="alert-error">{error}</div>}
                    {msg && <div className="alert-success">{msg}</div>}

                    <div className="form-row">
                        <div className="input-group">
                            <label>Fecha de Inicio</label>
                            <input
                                type="date"
                                min={minDate}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Fecha de Fin</label>
                            <input
                                type="date"
                                min={startDate || minDate}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Comentarios (Opcional)</label>
                        <textarea
                            placeholder="Ej: Viaje familiar..."
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className="input-field textarea-field"
                            rows={3}
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
                <h3 className="subsection-title">Historial de Solicitudes</h3>
                {fetching ? (
                    <div className="loading-state">Cargando...</div>
                ) : vacations.length === 0 ? (
                    <div className="empty-state">No hay solicitudes de vacaciones.</div>
                ) : (
                    <div className="list-container">
                        {vacations.map(vac => (
                            <div key={vac.id} className="list-item">
                                <div className="list-item-header">
                                    <div className="list-item-title">
                                        {formatDate(vac.start_date)} - {formatDate(vac.end_date)}
                                    </div>
                                    {getStatusBadge(vac.status)}
                                </div>
                                {vac.comments && <p className="list-item-desc">{vac.comments}</p>}
                                <div className="list-item-meta">
                                    Solicitado: {new Date(vac.created_at).toLocaleDateString('es-ES')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
