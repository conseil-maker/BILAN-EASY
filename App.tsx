import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { authService } from './services/authService';
import { Profile } from './lib/supabaseClient';

type AppState = 'loading' | 'login' | 'dashboard';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('loading');
    const [currentUser, setCurrentUser] = useState<Profile | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('[APP] Initialisation...');
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            console.log('[APP] Vérification authentification...');
            const user = await authService.getCurrentUser();
            if (user) {
                console.log('[APP] Utilisateur trouvé:', user.email);
                await loadUserProfile();
            } else {
                console.log('[APP] Aucun utilisateur connecté');
                setAppState('login');
            }
        } catch (error) {
            console.error('[APP] Erreur auth:', error);
            setError(error instanceof Error ? error.message : 'Erreur inconnue');
            setAppState('login');
        }
    };

    const loadUserProfile = async () => {
        try {
            console.log('[APP] Chargement du profil...');
            const profile = await authService.getUserProfile();
            if (profile) {
                console.log('[APP] Profil chargé:', profile.role);
                setCurrentUser(profile);
                setAppState('dashboard');
            } else {
                console.log('[APP] Aucun profil trouvé');
                setAppState('login');
            }
        } catch (error) {
            console.error('[APP] Erreur chargement profil:', error);
            setError(error instanceof Error ? error.message : 'Erreur inconnue');
            setAppState('login');
        }
    };

    const handleLoginSuccess = async () => {
        console.log('[APP] Connexion réussie');
        await loadUserProfile();
    };

    const handleLogout = async () => {
        console.log('[APP] Déconnexion...');
        await authService.signOut();
        setCurrentUser(null);
        setAppState('login');
    };

    if (appState === 'loading') {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontFamily: 'Arial, sans-serif'
            }}>
                <div>
                    <h2>Chargement...</h2>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
            </div>
        );
    }

    if (appState === 'login') {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    // Dashboard simple
    return (
        <div style={{ 
            padding: '20px',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{ 
                maxWidth: '1200px', 
                margin: '0 auto'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '30px',
                    borderBottom: '2px solid #e0e0e0',
                    paddingBottom: '20px'
                }}>
                    <h1 style={{ margin: 0, color: '#333' }}>
                        Bilan de Compétences IA
                    </h1>
                    <div>
                        <span style={{ marginRight: '20px', color: '#666' }}>
                            {currentUser?.full_name || currentUser?.email}
                        </span>
                        <span style={{ 
                            marginRight: '20px', 
                            padding: '5px 10px',
                            background: '#4CAF50',
                            color: 'white',
                            borderRadius: '4px',
                            fontSize: '12px'
                        }}>
                            {currentUser?.role?.toUpperCase()}
                        </span>
                        <button 
                            onClick={handleLogout}
                            style={{
                                padding: '8px 16px',
                                background: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Déconnexion
                        </button>
                    </div>
                </div>

                <div style={{ 
                    background: '#f5f5f5', 
                    padding: '40px',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ color: '#4CAF50' }}>✅ Connexion réussie !</h2>
                    <p style={{ fontSize: '18px', color: '#666' }}>
                        Bienvenue, <strong>{currentUser?.full_name || currentUser?.email}</strong>
                    </p>
                    <p style={{ color: '#999' }}>
                        Rôle : <strong>{currentUser?.role}</strong>
                    </p>
                    <div style={{ marginTop: '30px' }}>
                        <p style={{ color: '#666' }}>
                            L'application complète avec tous les dashboards sera restaurée progressivement.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
