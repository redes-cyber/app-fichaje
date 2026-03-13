import React from 'react';
import { Clock, Calendar, AlertTriangle, User, ShieldAlert, FileSignature } from 'lucide-react';

export function BottomNav({ activeTab, setActiveTab, isAdmin }) {
    const tabs = [
        { id: 'fichaje', label: 'Fichaje', icon: Clock },
        { id: 'conformes', label: 'Conformes', icon: FileSignature },
        { id: 'vacaciones', label: 'Vacaciones', icon: Calendar },
        { id: 'incidencias', label: 'Incidencias', icon: AlertTriangle },
        { id: 'perfil', label: 'Perfil', icon: User },
    ];

    if (isAdmin) {
        tabs.push({ id: 'admin', label: 'Admin', icon: ShieldAlert });
    }

    return (
        <nav className="bottom-nav">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                >
                    <tab.icon size={24} />
                    <span>{tab.label}</span>
                </button>
            ))}
        </nav>
    );
}
