import React from 'react';

export function HistoryLog({ sessions, onRefresh }) {
    if (!sessions || sessions.length === 0) {
        return (
            <div className="history-container empty">
                <h3>Historial de Jornadas</h3>
                <p>Aún no hay jornadas registradas.</p>
                {onRefresh && (
                    <button className="btn-text mt-4" onClick={onRefresh}>↻ Actualizar</button>
                )}
            </div>
        );
    }

    const formatHoras = (h) => {
        if (h === null || h === undefined || h === '') return '—';
        const num = parseFloat(h);
        if (isNaN(num)) return h;
        const hours = Math.floor(num);
        const mins = Math.round((num - hours) * 60);
        return `${hours}h ${mins.toString().padStart(2, '0')}m`;
    };

    return (
        <div className="history-container">
            <div className="history-header flex justify-between items-center mb-4 px-2">
                <h3 className="font-semibold">Historial de Jornadas</h3>
                {onRefresh && (
                    <button className="btn-text" onClick={onRefresh}>↻ Actualizar</button>
                )}
            </div>

            <div className="sessions-table-wrapper">
                <table className="sessions-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Entrada</th>
                            <th>Salida</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((s, i) => (
                            <tr key={i} className={s._open || !s.hora_salida ? 'row-open' : ''}>
                                <td>{s.fecha || '—'}</td>
                                <td className="td-entrada">{s.hora_entrada || '—'}</td>
                                <td className="td-salida">
                                    {(!s.hora_salida || s._open)
                                        ? <span className="badge-open">Activo</span>
                                        : s.hora_salida}
                                </td>
                                <td className="td-total">{formatHoras(s.total_horas)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
