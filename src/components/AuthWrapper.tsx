import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import LoginPro from './LoginPro';
import Signup from './Signup';
import i18n from '../i18n';

interface AuthWrapperProps {
  children: (user: User, userRole: string) => React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { t } = useTranslation('auth');
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('client'); // Default to 'client'
  const [loading, setLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  
  // Ref pour suivre si on vient de se connecter (pour ignorer les SIGNED_OUT intempestifs)
  const justSignedInRef = useRef(false);
  const signedInTimestampRef = useRef<number>(0);
  // Ref pour éviter le problème de stale closure dans le timeout
  const loadingResolvedRef = useRef(false);

  // Fonction pour récupérer ou créer le profil utilisateur (NON-BLOQUANTE)
  const fetchOrCreateUserProfile = useCallback(async (userId: string, userEmail: string): Promise<string> => {
    try {
      // Timeout de 5 secondes pour l'appel profil
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      // Essayer de récupérer le profil existant
      const { data, error } = await supabase
        .from('profiles')
        .select('role, preferred_language')
        .eq('id', userId)
        .maybeSingle()
        .abortSignal(controller.signal);

      clearTimeout(timeout);

      if (error && error.code !== 'PGRST116') {
        console.error('[AuthWrapper] Erreur récupération profil:', error);
        return 'client';
      }

      // Si le profil existe, appliquer la langue préférée et retourner le rôle
      if (data?.role) {
        console.log('[AuthWrapper] Profil existant trouvé, rôle:', data.role);
        // Appliquer la langue préférée de l'utilisateur
        if (data.preferred_language && data.preferred_language !== i18n.language?.substring(0, 2)) {
          console.log('[AuthWrapper] Application de la langue préférée:', data.preferred_language);
          i18n.changeLanguage(data.preferred_language);
          localStorage.setItem('bilan-easy-language', data.preferred_language);
        }
        return data.role;
      }

      // Si le profil n'existe pas, le créer (en arrière-plan, non-bloquant)
      console.log('[AuthWrapper] Profil non trouvé, création...');
      supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail,
          role: 'client',
          full_name: userEmail.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .then(({ error: insertError }) => {
          if (insertError) {
            console.error('[AuthWrapper] Erreur création profil:', insertError);
          } else {
            console.log('[AuthWrapper] Profil créé avec succès');
          }
        });

      return 'client';
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        console.warn('[AuthWrapper] Timeout récupération profil (5s), utilisation du rôle par défaut');
      } else {
        console.error('[AuthWrapper] Exception récupération/création profil:', error);
      }
      return 'client';
    }
  }, []);

  // Fonction helper pour résoudre l'authentification
  const resolveAuth = useCallback((authUser: User, role: string) => {
    setUser(authUser);
    setUserRole(role);
    loadingResolvedRef.current = true;
    setLoading(false);
    console.log('[AuthWrapper] Auth résolue pour:', authUser.email, 'rôle:', role);
  }, []);

  // Effet principal - s'exécute une seule fois au montage
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log('[AuthWrapper] Initialisation de l\'authentification...');
      try {
        // Récupérer la session actuelle avec timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('getSession timeout')), 5000)
        );

        let session: Session | null = null;
        try {
          const result = await Promise.race([sessionPromise, timeoutPromise]);
          session = result.data?.session || null;
          if (result.error) {
            console.error('[AuthWrapper] Erreur getSession:', result.error);
          }
        } catch (e: any) {
          console.warn('[AuthWrapper] getSession timeout ou erreur:', e.message);
        }

        console.log('[AuthWrapper] Session récupérée:', !!session);

        if (session?.user && mounted) {
          // D'abord résoudre avec le rôle par défaut pour débloquer l'UI
          resolveAuth(session.user, 'client');
          
          // Puis charger le vrai rôle en arrière-plan
          fetchOrCreateUserProfile(session.user.id, session.user.email || '')
            .then(role => {
              if (mounted && role !== 'client') {
                console.log('[AuthWrapper] Mise à jour du rôle:', role);
                setUserRole(role);
              }
            });
        } else if (mounted) {
          console.log('[AuthWrapper] Pas de session, affichage du login');
          loadingResolvedRef.current = true;
          setLoading(false);
        }
      } catch (error) {
        console.error('[AuthWrapper] Exception initialisation:', error);
        if (mounted) {
          loadingResolvedRef.current = true;
          setLoading(false);
        }
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
              
              // Résoudre IMMÉDIATEMENT avec le rôle par défaut
              resolveAuth(session.user, 'client');
              
              // Charger le vrai rôle en arrière-plan
              fetchOrCreateUserProfile(session.user.id, session.user.email || '')
                .then(role => {
                  if (mounted && role !== 'client') {
                    console.log('[AuthWrapper] Mise à jour du rôle après SIGNED_IN:', role);
                    setUserRole(role);
                  }
                });
            }
            break;
          
          case 'SIGNED_OUT':
            console.log('[AuthWrapper] SIGNED_OUT - Vérification...');
            
            // Ignorer les SIGNED_OUT qui arrivent dans les 60 secondes après un SIGNED_IN
            const timeSinceSignIn = Date.now() - signedInTimestampRef.current;
            if (justSignedInRef.current && timeSinceSignIn < 60000) {
              console.log('[AuthWrapper] SIGNED_OUT ignoré (trop proche du SIGNED_IN, delta:', timeSinceSignIn, 'ms)');
              return;
            }
            
            console.log('[AuthWrapper] SIGNED_OUT - Utilisateur déconnecté');
            justSignedInRef.current = false;
            if (mounted) {
              setUser(null);
              setUserRole('client');
              loadingResolvedRef.current = true;
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
            console.log('[AuthWrapper] INITIAL_SESSION:', !!session);
            // Géré par initializeAuth, mais si initializeAuth n'a pas encore résolu...
            if (session?.user && mounted && !loadingResolvedRef.current) {
              resolveAuth(session.user, 'client');
              fetchOrCreateUserProfile(session.user.id, session.user.email || '')
                .then(role => {
                  if (mounted && role !== 'client') {
                    setUserRole(role);
                  }
                });
            }
            break;
          
          default:
            console.log('[AuthWrapper] Autre événement:', event);
            if (session?.user && mounted) {
              setUser(session.user);
              if (!userRole || userRole === 'client') {
                fetchOrCreateUserProfile(session.user.id, session.user.email || '')
                  .then(role => {
                    if (mounted) setUserRole(role);
                  });
              }
            }
        }
      }
    );

    // Initialiser l'auth
    initializeAuth();

    // Timeout de sécurité de 8 secondes (utilise ref pour éviter stale closure)
    const timeout = setTimeout(() => {
      if (mounted && !loadingResolvedRef.current) {
        console.warn('[AuthWrapper] Timeout atteint (8s) - forcer l\'affichage');
        loadingResolvedRef.current = true;
        setLoading(false);
      }
    }, 8000);

    // Cleanup
    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [fetchOrCreateUserProfile, resolveAuth]);

  // Affichage du loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loading.session')}</p>
        </div>
      </div>
    );
  }

  // Affichage de la page de connexion/inscription
  if (!user) {
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
