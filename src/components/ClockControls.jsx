import React from 'react';

export function ClockControls({ onEntrada, onSalida, isClockedIn, activeSession, loading, error }) {
    const formatTime = (iso) => {
        if (!iso) return '--:--';
        return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="clock-controls-container">
            {isClockedIn && activeSession ? (
                <div className="active-session-banner">
                    <span className="pulse-dot"></span>
                    <span>Fichado desde las <strong>{formatTime(activeSession.hora_entrada)}</strong></span>
                </div>
            ) : (
                <p className="subtitle">Registra tu jornada de trabajo</p>
            )}

            <div className="button-group">
                {!isClockedIn ? (
                    <button
                        className="btn btn-entrada"
                        onClick={onEntrada}
                        disabled={loading}
                    >
                        {loading ? '⏳ Obteniendo ubicación...' : '✅ Fichar Entrada'}
                    </button>
                ) : (
                    <button
                        className="btn btn-salida"
                        onClick={onSalida}
                        disabled={loading}
                    >
                        {loading ? '⏳ Obteniendo ubicación...' : '🔴 Fichar Salida'}
                    </button>
                )}
            </div>

            {error && <div className="error-message">⚠️ {error}</div>}
        </div>
    );
}
