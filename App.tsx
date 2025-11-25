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
    
    // Écouter les changements d'authentification
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadUserProfile();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        await loadUserProfile();
      }
    } catch (error) {
      console.error('Erreur auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const profile = await authService.getUserProfile();
      if (profile) {
        setCurrentUser(profile);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
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

  // Afficher le dashboard selon le rôle
  if (currentUser?.role === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (currentUser?.role === 'consultant') {
    return <ConsultantDashboard onLogout={handleLogout} />;
  }

  // Dashboard client par défaut
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
          <h3>🚀 Parcours Client</h3>
          <p>Le parcours complet de bilan de compétences avec coach IA sera bientôt disponible.</p>
          <p>Fonctionnalités à venir :</p>
          <ul>
            <li>Sélection du package de bilan</li>
            <li>Upload de CV</li>
            <li>Questionnaire personnalisé</li>
            <li>Coach IA conversationnel</li>
            <li>Génération de synthèse PDF</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
