import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
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

  // Fonction pour récupérer le rôle utilisateur
  const fetchUserRole = useCallback(async (userId: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthWrapper] Erreur récupération rôle:', error);
        return 'client';
      }
      return data?.role || 'client';
    } catch (error) {
      console.error('[AuthWrapper] Exception récupération rôle:', error);
      return 'client';
    }
  }, []);

  // Effet principal - s'exécute une seule fois au montage
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log('[AuthWrapper] Initialisation de l\'authentification...');
      try {
        // Récupérer la session actuelle
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthWrapper] Erreur getSession:', error);
          if (mounted) setLoading(false);
          return;
        }

        console.log('[AuthWrapper] Session récupérée:', !!session);

        if (session?.user && mounted) {
          const role = await fetchUserRole(session.user.id);
          console.log('[AuthWrapper] Rôle utilisateur:', role);
          if (mounted) {
            setUser(session.user);
            setUserRole(role);
            setLoading(false);
          }
        } else if (mounted) {
          console.log('[AuthWrapper] Pas de session, affichage du login');
          setLoading(false);
        }
      } catch (error) {
        console.error('[AuthWrapper] Exception initialisation:', error);
        if (mounted) setLoading(false);
      }
    };

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('[AuthWrapper] Auth event:', event, 'Session:', !!session);

        if (!mounted) return;

        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              console.log('[AuthWrapper] SIGNED_IN - Utilisateur connecté:', session.user.email);
              const role = await fetchUserRole(session.user.id);
              if (mounted) {
                setUser(session.user);
                setUserRole(role);
                setLoading(false);
              }
            }
            break;
          
          case 'SIGNED_OUT':
            console.log('[AuthWrapper] SIGNED_OUT - Utilisateur déconnecté');
            if (mounted) {
              setUser(null);
              setUserRole(null);
              setLoading(false);
            }
            break;
          
          case 'TOKEN_REFRESHED':
            console.log('[AuthWrapper] TOKEN_REFRESHED');
            if (session?.user && mounted) {
              setUser(session.user);
            }
            break;
          
          case 'INITIAL_SESSION':
            console.log('[AuthWrapper] INITIAL_SESSION');
            // Géré par initializeAuth
            break;
          
          default:
            console.log('[AuthWrapper] Autre événement:', event);
            // Pour les autres événements, mettre à jour si session valide
            if (session?.user && mounted) {
              setUser(session.user);
              if (!userRole) {
                const role = await fetchUserRole(session.user.id);
                if (mounted) setUserRole(role);
              }
            }
        }
      }
    );

    // Initialiser l'auth
    initializeAuth();

    // Timeout de sécurité de 10 secondes
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[AuthWrapper] Timeout atteint');
        setLoading(false);
      }
    }, 10000);

    // Cleanup
    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [fetchUserRole]); // Ajouter fetchUserRole comme dépendance

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
