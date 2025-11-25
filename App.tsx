import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { authService } from './services/authService';
import { Profile } from './lib/supabaseClient';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const profile = await authService.getUserProfile();
        if (profile) {
          setCurrentUser(profile);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Erreur auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async () => {
    await checkAuth();
  };

  const handleLogout = async () => {
    await authService.signOut();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1>Bilan de Compétences IA</h1>
        <div style={{ 
          background: '#f0f9ff', 
          padding: '20px', 
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <h2>Bienvenue, {currentUser?.full_name || currentUser?.email}</h2>
          <p><strong>Rôle :</strong> {currentUser?.role}</p>
          <p><strong>Email :</strong> {currentUser?.email}</p>
        </div>
        
        <button 
          onClick={handleLogout}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Déconnexion
        </button>

        <div style={{ marginTop: '40px', padding: '20px', background: '#fef3c7', borderRadius: '8px' }}>
          <h3>🚧 Application en cours de développement</h3>
          <p>L'authentification fonctionne ! Les dashboards Admin, Consultant et le parcours Client seront bientôt disponibles.</p>
        </div>
      </div>
    </div>
  );
};

export default App;
