import React, { useState } from 'react';

export function RegistrationForm({ onRegister }) {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onRegister(name.trim());
        }
    };

    return (
        <div className="registration-container">
            <h2>Registro de Empleado</h2>
            <p className="subtitle">Por favor, introduce tu nombre para comenzar a fichar.</p>

            <form onSubmit={handleSubmit} className="registration-form">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="input-field"
                    required
                />
                <button type="submit" className="btn btn-primary">
                    Registrar y Continuar
                </button>
            </form>
        </div>
    );
}
