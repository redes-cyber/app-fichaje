import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { Fichaje } from './components/Fichaje';
import { Vacations } from './components/Vacations';
import { Incidents } from './components/Incidents';
import { Profile } from './components/Profile';
import { AdminDashboard } from './components/AdminDashboard';
import { WorkConfirmations } from './components/WorkConfirmations';
import { BottomNav } from './components/BottomNav';
import './index.css';

function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('fichaje');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkRole(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkRole(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkRole = async (sess) => {
    if (!sess) {
      setIsAdmin(false);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', sess.user.id)
      .single();

    setIsAdmin(data?.role === 'admin' || sess.user.email === 'limpiezabalear@gmail.com');
  };

  if (!session) {
    return (
      <div className="app-container">
        <Auth />
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
        {activeTab === 'perfil' && <Profile session={session} />}
        {activeTab === 'admin' && isAdmin && <AdminDashboard />}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} />
    </div>
  );
}

export default App;
