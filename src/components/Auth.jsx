import React, { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { auth } from '../lib/storage';

export function Auth({ onLogin }) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [authError, setAuthError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;
        setLoading(true);
        setAuthError(null);

        try {
            if (isRegistering) {
                const { session } = await auth.signUp({ email, password });
                onLogin(session.user.email);
            } else {
                const { session } = await auth.signInWithPassword({ email, password });
                onLogin(session.user.email);
            }
        } catch (error) {
            setAuthError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-panel">
                <header className="auth-header">
                    <img src="/logo.png" alt="Limpieza Balear" className="auth-logo" />
                    <p className="auth-subtitle">Sistema de Gestión de Personal</p>
                </header>

                <form onSubmit={handleSubmit} className="auth-form">
                    {authError && <div className="alert-error mb-4 text-sm">{authError}</div>}
                    
                    <div className="input-group">
                        <label>Correo Electrónico</label>
                        <div className="input-with-icon">
                            <Mail className="input-icon" size={20} />
                            <input
                                type="email"
                                placeholder="usuario@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Contraseña</label>
                        <div className="input-with-icon">
                            <Lock className="input-icon" size={20} />
                            <input
                                type="password"
                                placeholder="******"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button type="submit" className="btn btn-primary w-full flex justify-center items-center" disabled={loading}>
                            {loading ? <Loader2 className="spin" size={20} /> : (isRegistering ? 'Crear mi cuenta' : 'Iniciar Sesión')}
                        </button>
                        
                        <div className="text-center relative py-2">
                             <div className="absolute inset-0 flex items-center">
                                 <div className="w-full border-t border-gray-300"></div>
                             </div>
                             <div className="relative flex justify-center text-sm">
                                 <span className="px-2 bg-white text-gray-500">O</span>
                             </div>
                        </div>

                        <button 
                            type="button" 
                            onClick={() => setIsRegistering(!isRegistering)} 
                            className="w-full py-2 px-4 border border-sky-600 text-sky-600 rounded-lg hover:bg-sky-50 transition-colors font-medium text-sm"
                        >
                            {isRegistering ? 'Ya tengo cuenta (Iniciar sesión)' : 'No tengo cuenta (Registrarse)'}
                        </button>
                    </div>
                </form>

                <footer className="auth-footer">
                    <p>© 2025 Limpieza Balear Mallorca</p>
                </footer>
            </div>
        </div>
    );
}
