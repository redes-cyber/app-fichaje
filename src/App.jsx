import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Fichaje } from './components/Fichaje';
import { Vacations } from './components/Vacations';
import { Incidents } from './components/Incidents';
import { Profile } from './components/Profile';
import { AdminDashboard } from './components/AdminDashboard';
import { WorkConfirmations } from './components/WorkConfirmations';
import { BottomNav } from './components/BottomNav';
import { auth } from './lib/storage';
import './index.css';

function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('fichaje');

  useEffect(() => {
    auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkRole(session.user.email);
    });
  }, []);

  const checkRole = (email) => {
    setIsAdmin(email === 'limpiezabalear@gmail.com');
  };

  const loginUser = (email) => {
    // Cuando el usuario haga login, seteamos la sesion sin refrescar pagina
    auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        checkRole(email);
    });
  };

  const logoutUser = async () => {
    await auth.signOut();
    localStorage.removeItem('openSession');
    setSession(null);
    setActiveTab('fichaje');
  };

  if (!session) {
    return (
      <div className="app-container">
        <Auth onLogin={loginUser} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header-main">
        <img src="/logo.png" alt="Limpieza Balear" className="app-logo-main" />
      </header>

      <main className="main-content">
        {activeTab === 'fichaje' && <Fichaje session={session} />}
        {activeTab === 'conformes' && <WorkConfirmations session={session} />}
        {activeTab === 'vacaciones' && <Vacations session={session} />}
        {activeTab === 'incidencias' && <Incidents session={session} />}
        {activeTab === 'perfil' && <Profile session={session} onLogout={logoutUser} />}
        {activeTab === 'admin' && isAdmin && <AdminDashboard />}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} />
    </div>
  );
}

export default App;
