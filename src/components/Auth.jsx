import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2 } from 'lucide-react';

export function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMsg(null);

        try {
            if (isSignUp) {
                if (!fullName) {
                    throw new Error('El nombre completo es obligatorio para registrarse.');
                }
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                });
                if (error) throw error;
                setMsg('Revisa tu correo para verificar la cuenta.');
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-panel auth-panel">
                <div className="auth-header">
                    <img src="/logo.png" alt="Limpieza Balear" className="auth-logo" />
                    <p className="auth-subtitle">{isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}</p>
                </div>

                {error && <div className="alert-error">{error}</div>}
                {msg && <div className="alert-success">{msg}</div>}

                <form onSubmit={handleAuth} className="auth-form">
                    {isSignUp && (
                        <div className="input-group">
                            <label>Nombre Completo</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Tu nombre y apellidos"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="input-field"
                                    required={isSignUp}
                                />
                            </div>
                        </div>
                    )}

                    <div className="input-group">
                        <label>Correo Electrónico</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field with-icon"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Contraseña</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field with-icon"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? <Loader2 className="spin" size={20} /> : (isSignUp ? 'Registrarse' : 'Entrar')}
                    </button>
                </form>

                <div className="auth-footer">
                    <button
                        type="button"
                        className="btn-text"
                        onClick={() => setIsSignUp(!isSignUp)}
                    >
                        {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                    </button>
                </div>
            </div>
        </div>
    );
}
