import React from 'react';

export function HistoryLog({ sessions }) {
    if (!sessions || sessions.length === 0) {
        return (
            <div className="history-container empty">
                <h3>Historial de Jornadas</h3>
                <p>Aún no hay jornadas registradas.</p>
            </div>
        );
    }

    const formatTime = (iso) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    const formatHoras = (h) => {
        if (h === null || h === undefined) return '—';
        const hours = Math.floor(h);
        const mins = Math.round((h - hours) * 60);
        return `${hours}h ${mins.toString().padStart(2, '0')}m`;
    };

    return (
        <div className="history-container">
            <div className="history-header">
                <h3>Historial de Jornadas</h3>
            </div>

            <div className="sessions-table-wrapper">
                <table className="sessions-table">
                    <thead>
                        <tr>
                            <th>Empleado</th>
                            <th>Fecha</th>
                            <th>Entrada</th>
                            <th>Salida</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((s) => (
                            <tr key={s.id} className={s.session_open ? 'row-open' : ''}>
                                <td className="td-employee">👤 {s.empleado}</td>
                                <td>{formatDate(s.fecha)}</td>
                                <td className="td-entrada">{formatTime(s.hora_entrada)}</td>
                                <td className="td-salida">{s.session_open ? <span className="badge-open">Activo</span> : formatTime(s.hora_salida)}</td>
                                <td className="td-total">{s.session_open ? '—' : formatHoras(s.total_horas)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
