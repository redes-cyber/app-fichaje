import React, { useState } from 'react';

// Lista oficial de empleadas - debe coincidir EXACTAMENTE con las pestañas de Google Sheets
const EMPLEADAS = [
    'Aldri Garcia',
    'Yosibel Mora',
    'Nilmary Herrera',
    'Zoyla Pomareda',
    'Cristina Spinola',
    'Lliuben Diaz',
];

export function RegistrationForm({ onRegister }) {
    const [selected, setSelected] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selected) {
            onRegister(selected);
        }
    };

    return (
        <div className="registration-container">
            <div className="reg-logo">🧹</div>
            <h2>Control Horario</h2>
            <p className="subtitle">Selecciona tu nombre para comenzar a fichar</p>

            <form onSubmit={handleSubmit} className="registration-form">
                <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                    className="input-field select-field"
                    required
                >
                    <option value="" disabled>— Selecciona tu nombre —</option>
                    {EMPLEADAS.map((name) => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!selected}
                >
                    Continuar →
                </button>
            </form>
        </div>
    );
}
