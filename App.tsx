import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { ConsultantDashboard } from './components/ConsultantDashboard';
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
    console.log('[APP] Vérification de l\'authentification');
    try {
      const user = await authService.getCurrentUser();
      console.log('[APP] Utilisateur actuel:', user?.email || 'aucun');
      if (user) {
        const profile = await authService.getUserProfile();
        console.log('[APP] Profil récupéré:', profile);
        if (profile) {
          setCurrentUser(profile);
          setIsAuthenticated(true);
          console.log('[APP] Authentification réussie');
        }
      }
    } catch (error) {
      console.error('[APP] Erreur auth:', error);
    } finally {
      setLoading(false);
      console.log('[APP] Fin de checkAuth');
    }
  };

  const handleLoginSuccess = async () => {
    console.log('[APP] handleLoginSuccess appelé');
    await checkAuth();
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setIsAuthenticated(false);
      setCurrentUser(null);
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '24px' }}>Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Afficher le dashboard selon le rôle
  if (currentUser?.role === 'admin') {
    return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  if (currentUser?.role === 'consultant') {
    return <ConsultantDashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  // Interface client par défaut
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Bilan de Compétences IA
          </h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Déconnexion
          </button>
        </div>

        <div style={{
          padding: '32px',
          background: '#f5f5f5',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#333' }}>
            Bienvenue {currentUser?.full_name || 'Client'} !
          </h2>
          <p style={{ color: '#666', marginBottom: '8px' }}>
            Email: {currentUser?.email}
          </p>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Rôle: {currentUser?.role}
          </p>
          <div style={{
            padding: '24px',
            background: 'white',
            borderRadius: '8px',
            border: '2px dashed #667eea'
          }}>
            <p style={{ color: '#667eea', fontSize: '18px', fontWeight: '600' }}>
              Interface client en cours de développement
            </p>
            <p style={{ color: '#999', marginTop: '12px' }}>
              Le parcours complet de bilan de compétences sera bientôt disponible
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
