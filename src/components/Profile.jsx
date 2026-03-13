import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Briefcase, LogOut } from 'lucide-react';

export function Profile({ session }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, [session]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            setProfile(data || {
                full_name: session.user.user_metadata?.full_name || 'Usuario',
                email: session.user.email,
                role: 'user'
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    if (loading) return <div className="loading-state">Cargando perfil...</div>;

    return (
        <div className="tab-pane">
            <div className="glass-panel profile-panel">
                <div className="profile-header">
                    <div className="avatar-circle">
                        <User size={40} />
                    </div>
                    <h2>Mi Perfil</h2>
                </div>

                <div className="profile-info">
                    <div className="info-group">
                        <div className="info-icon"><User size={20} /></div>
                        <div className="info-content">
                            <label>Nombre Completo</label>
                            <div className="info-value">{profile?.full_name}</div>
                        </div>
                    </div>

                    <div className="info-group">
                        <div className="info-icon"><Mail size={20} /></div>
                        <div className="info-content">
                            <label>Correo Electrónico</label>
                            <div className="info-value">{session.user.email}</div>
                        </div>
                    </div>

                    <div className="info-group">
                        <div className="info-icon"><Briefcase size={20} /></div>
                        <div className="info-content">
                            <label>Cargo / Rol</label>
                            <div className="info-value capitalize">{profile?.role === 'admin' ? 'Administrador' : 'Empleado'}</div>
                        </div>
                    </div>
                </div>

                <button onClick={handleSignOut} className="btn btn-logout mt-8">
                    <LogOut size={20} />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
