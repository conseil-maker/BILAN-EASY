import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, refreshSession, isSessionValid } from '../lib/supabaseClient';
import { User, AuthChangeEvent } from '@supabase/supabase-js';
import LoginPro from './LoginPro';
import Signup from './Signup';

interface AuthWrapperProps {
  children: (user: User, userRole: string) => React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Fonction pour récupérer le rôle utilisateur
  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthWrapper] Erreur récupération rôle:', error);
        // En cas d'erreur, on garde le rôle par défaut
        setUserRole('client');
      } else {
        setUserRole(data?.role || 'client');
      }
    } catch (error) {
      console.error('[AuthWrapper] Exception récupération rôle:', error);
      setUserRole('client');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour initialiser la session
  const initializeSession = useCallback(async () => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    try {
      // Vérifier d'abord si une session existe dans le localStorage
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[AuthWrapper] Erreur getSession:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        // Session existante trouvée
        setUser(session.user);
        await fetchUserRole(session.user.id);
        
        // Vérifier si le token doit être rafraîchi
        const valid = await isSessionValid();
        if (!valid) {
          console.log('[AuthWrapper] Session expirée, tentative de rafraîchissement...');
          const newSession = await refreshSession();
          if (newSession) {
            setUser(newSession.user);
          } else {
            // Session invalide et non rafraîchissable
            setUser(null);
            setUserRole(null);
          }
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('[AuthWrapper] Exception initialisation:', error);
      setLoading(false);
    }
  }, [fetchUserRole]);

  // Effet principal pour l'initialisation et l'écoute des changements d'auth
  useEffect(() => {
    // Timeout de sécurité de 15 secondes
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('[AuthWrapper] Timeout atteint, arrêt du chargement');
        setLoading(false);
      }
    }, 15000);

    // Initialiser la session
    initializeSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        console.log('[AuthWrapper] Auth event:', event);

        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            if (session?.user) {
              setUser(session.user);
              await fetchUserRole(session.user.id);
            }
            break;
          
          case 'SIGNED_OUT':
            setUser(null);
            setUserRole(null);
            setLoading(false);
            // Nettoyer le localStorage
            localStorage.removeItem('bilan-easy-auth');
            break;
          
          case 'USER_UPDATED':
            if (session?.user) {
              setUser(session.user);
            }
            break;
          
          case 'INITIAL_SESSION':
            // Session initiale déjà gérée par initializeSession
            break;
          
          default:
            // Pour les autres événements, mettre à jour l'état si nécessaire
            if (session?.user) {
              setUser(session.user);
              if (!userRole) {
                await fetchUserRole(session.user.id);
              }
            }
        }
      }
    );

    // Configurer un intervalle de rafraîchissement toutes les 10 minutes
    refreshIntervalRef.current = setInterval(async () => {
      if (user) {
        const valid = await isSessionValid();
        if (!valid) {
          console.log('[AuthWrapper] Rafraîchissement périodique de la session...');
          const newSession = await refreshSession();
          if (!newSession) {
            console.warn('[AuthWrapper] Échec du rafraîchissement, déconnexion...');
            setUser(null);
            setUserRole(null);
          }
        }
      }
    }, 10 * 60 * 1000); // 10 minutes

    // Écouter les événements de visibilité de la page
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && user) {
        // Quand l'utilisateur revient sur l'onglet, vérifier la session
        const valid = await isSessionValid();
        if (!valid) {
          const newSession = await refreshSession();
          if (!newSession) {
            setUser(null);
            setUserRole(null);
          }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initializeSession, fetchUserRole, user, userRole]);

  // Affichage du loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement de votre session...</p>
        </div>
      </div>
    );
  }

  // Affichage de la page de connexion/inscription
  if (!user || !userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {showSignup ? (
          <Signup onToggle={() => setShowSignup(false)} />
        ) : (
          <LoginPro onToggle={() => setShowSignup(true)} />
        )}
      </div>
    );
  }

  // Rendu des enfants avec l'utilisateur authentifié
  return <>{children(user, userRole)}</>;
};

export default AuthWrapper;
