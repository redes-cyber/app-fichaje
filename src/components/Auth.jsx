import React, { useState } from 'react';
import { Mail, Loader2, User } from 'lucide-react';
import { registrarUsuario } from '../lib/sheets';

export function Auth({ onLogin }) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);

        // Con Google Sheets creamos o usamos la hoja individual del usuario
        await registrarUsuario(name);

        onLogin(name);
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-panel">
                <header className="auth-header">
                    <img src="/logo.png" alt="Limpieza Balear" className="auth-logo" />
                    <p className="auth-subtitle">Sistema de Gestión de Personal</p>
                </header>

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="input-group">
                        <label>Correo Electrónico</label>
                        <div className="input-with-icon">
                            <User className="input-icon" size={20} />
                            <input
                                type="email"
                                placeholder="usuario@limpiezabalearmallorca.es"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? <Loader2 className="spin" size={20} /> : 'Iniciar Sesión'}
                    </button>
                </form>

                <footer className="auth-footer">
                    <p>© 2025 Limpieza Balear Mallorca</p>
                </footer>
            </div>
        </div>
    );
}
