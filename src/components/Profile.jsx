import React from 'react';
import { User, Mail, LogOut, ShieldCheck } from 'lucide-react';

export function Profile({ session, onLogout }) {
    const { email, user_metadata } = session.user;
    const fullName = user_metadata?.full_name || email;

    return (
        <div className="tab-pane">
            <div className="glass-panel profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        {fullName.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="profile-name">{fullName}</h2>
                    <div className="profile-badge">
                        <ShieldCheck size={14} />
                        {email === 'limpiezabalear@gmail.com' ? 'Administrador' : 'Empleado'}
                    </div>
                </div>

                <div className="profile-info">
                    <div className="info-item">
                        <Mail className="info-icon" size={20} />
                        <div className="info-content">
                            <label>Correo Electrónico</label>
                            <p>{email}</p>
                        </div>
                    </div>
                    <div className="info-item">
                        <User className="info-icon" size={20} />
                        <div className="info-content">
                            <label>ID de Empleado</label>
                            <p>{email}</p>
                        </div>
                    </div>
                </div>

                <button onClick={onLogout} className="logout-btn">
                    <LogOut size={20} />
                    Cerrar Sesión
                </button>
            </div>

            <div className="glass-panel mt-4">
                <h3 className="subsection-title">Información de la App</h3>
                <p className="text-sm text-gray-600 mb-2">
                    Versión: 2.1.0 (Google Sheets Edition)
                </p>
                <p className="text-xs text-gray-500">
                    Esta aplicación utiliza Google Sheets para el almacenamiento de datos, lo que garantiza que no se necesiten configuraciones complejas de base de datos.
                </p>
            </div>
        </div>
    );
}
