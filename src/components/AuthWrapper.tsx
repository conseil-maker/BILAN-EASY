import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Ref pour suivre si on vient de se connecter (pour ignorer les SIGNED_OUT intempestifs)
  const justSignedInRef = useRef(false);
  const signedInTimestampRef = useRef<number>(0);

  // Fonction pour récupérer ou créer le profil utilisateur
  const fetchOrCreateUserProfile = useCallback(async (userId: string, userEmail: string): Promise<string> => {
    try {
      // Essayer de récupérer le profil existant
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('[AuthWrapper] Erreur récupération profil:', error);
        return 'client';
      }

      // Si le profil existe, retourner le rôle
      if (data?.role) {
        console.log('[AuthWrapper] Profil existant trouvé, rôle:', data.role);
        return data.role;
      }

      // Si le profil n'existe pas, le créer
      console.log('[AuthWrapper] Profil non trouvé, création...');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail,
          role: 'client',
          full_name: userEmail.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('[AuthWrapper] Erreur création profil:', insertError);
      } else {
        console.log('[AuthWrapper] Profil créé avec succès');
      }

      return 'client';
    } catch (error) {
      console.error('[AuthWrapper] Exception récupération/création profil:', error);
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
          const role = await fetchOrCreateUserProfile(session.user.id, session.user.email || '');
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
              // Marquer qu'on vient de se connecter
              justSignedInRef.current = true;
              signedInTimestampRef.current = Date.now();
              
              const role = await fetchOrCreateUserProfile(session.user.id, session.user.email || '');
              if (mounted) {
                setUser(session.user);
                setUserRole(role);
                setLoading(false);
              }
            }
            break;
          
          case 'SIGNED_OUT':
            console.log('[AuthWrapper] SIGNED_OUT - Vérification...');
            
            // Ignorer les SIGNED_OUT qui arrivent dans les 10 secondes après un SIGNED_IN
            // C'est souvent dû à des erreurs de refresh token qui ne sont pas critiques
            const timeSinceSignIn = Date.now() - signedInTimestampRef.current;
            if (justSignedInRef.current && timeSinceSignIn < 10000) {
              console.log('[AuthWrapper] SIGNED_OUT ignoré (trop proche du SIGNED_IN, delta:', timeSinceSignIn, 'ms)');
              // Ne PAS appeler getSession() ici car cela peut déclencher d'autres erreurs
              // Faire confiance au fait que la session est valide si on vient de se connecter
              return;
            }
            
            console.log('[AuthWrapper] SIGNED_OUT - Utilisateur déconnecté');
            justSignedInRef.current = false;
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
            if (session?.user && mounted) {
              setUser(session.user);
              if (!userRole) {
                const role = await fetchOrCreateUserProfile(session.user.id, session.user.email || '');
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
  }, [fetchOrCreateUserProfile]);

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
