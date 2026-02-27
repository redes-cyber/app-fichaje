import React from 'react';

export function HistoryLog({ records, onClear }) {
    if (!records || records.length === 0) {
        return (
            <div className="history-container empty">
                <h3>Historial de Registros</h3>
                <p>Aún no hay registros guardados.</p>
            </div>
        );
    }

    const getActionLabel = (action) => {
        switch (action) {
            case 'entrada': return 'Entrada';
            case 'salida': return 'Salida';
            case 'pausa': return 'Pausa';
            default: return action;
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'entrada': return 'text-green';
            case 'salida': return 'text-red';
            case 'pausa': return 'text-yellow';
            default: return '';
        }
    };

    return (
        <div className="history-container">
            <div className="history-header">
                <h3>Historial de Registros</h3>
                <button className="btn-clear" onClick={onClear}>Limpiar</button>
            </div>

            <ul className="history-list">
                {records.map((record) => (
                    <li key={record.id} className="history-item">
                        <div className="item-main">
                            <span className={`action-badge ${getActionColor(record.action)}`}>
                                {getActionLabel(record.action)}
                            </span>
                            <span className="timestamp">
                                {new Date(record.timestamp).toLocaleString('es-ES')}
                            </span>
                        </div>

                        <div className="item-employee">
                            <span className="employee-name">👤 {record.employeeName || 'Desconocido'}</span>
                        </div>

                        <div className="location-info">
                            {record.location ? (
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${record.location.lat},${record.location.lng}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="location-link"
                                >
                                    📍 Ver en Mapa (Precisión: {Math.round(record.location.accuracy)}m)
                                </a>
                            ) : (
                                <span className="no-location">Ubicación no disponible</span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
