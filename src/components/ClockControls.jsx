import React from 'react';

export function ClockControls({ onAction, loading, error }) {
    return (
        <div className="clock-controls-container">
            <h2>Control Horario</h2>
            <p className="subtitle">Limpieza Balear Mallorca</p>

            <div className="button-group">
                <button
                    className="btn btn-entrada"
                    onClick={() => onAction('entrada')}
                    disabled={loading}
                >
                    {loading ? 'Obteniendo...' : 'Entrada'}
                </button>

                <button
                    className="btn btn-pausa"
                    onClick={() => onAction('pausa')}
                    disabled={loading}
                >
                    {loading ? 'Obteniendo...' : 'Pausa'}
                </button>

                <button
                    className="btn btn-salida"
                    onClick={() => onAction('salida')}
                    disabled={loading}
                >
                    {loading ? 'Obteniendo...' : 'Salida'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}
        </div>
    );
}
