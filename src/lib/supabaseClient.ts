import { createClient } from '@supabase/supabase-js';

// Variables d'environnement Supabase (configurées dans Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables Supabase manquantes. Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'
  );
}

// Clé de stockage pour les tokens Supabase
const STORAGE_KEY = 'sb-pkhhxouuavfqzccahihe-auth-token';

/**
 * Nettoyer les tokens invalides du localStorage
 * Appelé avant la connexion pour éviter les conflits de tokens
 */
export const clearInvalidTokens = () => {
  if (typeof window === 'undefined') return;
  
  try {
    const storedSession = localStorage.getItem(STORAGE_KEY);
    if (storedSession) {
      const session = JSON.parse(storedSession);
      // Vérifier si le token est expiré
      if (session.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        if (session.expires_at < now) {
          console.log('[Supabase] Token expiré détecté, nettoyage...');
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  } catch (error) {
    console.error('[Supabase] Erreur lors du nettoyage des tokens:', error);
    // En cas d'erreur de parsing, supprimer le token corrompu
    localStorage.removeItem(STORAGE_KEY);
  }
};

// Nettoyer les tokens invalides au chargement du module
if (typeof window !== 'undefined') {
  clearInvalidTokens();
}

// Configuration Supabase optimisée pour la connexion par mot de passe
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Activer la persistance de session dans localStorage
    persistSession: true,
    // Le SDK gère le rafraîchissement automatique des tokens
    autoRefreshToken: true,
    // Détecter les sessions dans l'URL (pour les redirections OAuth)
    detectSessionInUrl: true,
    // Utiliser le stockage local pour la persistance
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Clé de stockage personnalisée
    storageKey: STORAGE_KEY,
    // Flux implicit : plus simple et fiable pour signInWithPassword
    flowType: 'implicit',
  },
});

/**
 * Fonction utilitaire pour vérifier et rafraîchir la session manuellement
 * Utilisée uniquement si nécessaire (ex: avant une opération critique)
 */
export const refreshSession = async () => {
  try {
    // D'abord vérifier si on a une session valide
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    
    if (!currentSession) {
      console.log('[Supabase] Pas de session à rafraîchir');
      return null;
    }
    
    // Vérifier si le token expire bientôt (moins de 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60;
    
    if (currentSession.expires_at && currentSession.expires_at - now > fiveMinutes) {
      // Le token est encore valide, pas besoin de rafraîchir
      return currentSession;
    }
    
    // Tenter le rafraîchissement
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.warn('[Supabase] Erreur lors du rafraîchissement:', error.message);
      // Si l'erreur est "refresh_token_not_found", nettoyer et retourner null
      if (error.message.includes('refresh_token') || error.message.includes('Refresh Token')) {
        console.log('[Supabase] Token de rafraîchissement invalide, nettoyage...');
        clearInvalidTokens();
        return null;
      }
      // Pour d'autres erreurs, retourner la session actuelle si elle est encore valide
      return currentSession;
    }
    
    return data.session;
  } catch (err) {
    console.error('[Supabase] Exception lors du rafraîchissement:', err);
    return null;
  }
};

/**
 * Fonction pour vérifier si la session est valide
 */
export const isSessionValid = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      return false;
    }
    
    // Vérifier si le token est expiré
    const expiresAt = session.expires_at;
    if (expiresAt) {
      const now = Math.floor(Date.now() / 1000);
      if (expiresAt < now) {
        return false;
      }
    }
    
    return true;
  } catch (err) {
    console.error('[Supabase] Erreur de vérification de session:', err);
    return false;
  }
};

/**
 * Fonction pour se déconnecter proprement
 * Nettoie les tokens locaux avant la déconnexion
 */
export const signOutClean = async () => {
  try {
    // Nettoyer le localStorage d'abord
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    // Puis appeler signOut
    await supabase.auth.signOut();
    console.log('[Supabase] Déconnexion propre effectuée');
  } catch (error) {
    console.error('[Supabase] Erreur lors de la déconnexion:', error);
  }
};

// Types pour les tables Supabase
export interface Assessment {
  id: string;
  client_id: string;
  consultant_id?: string;
  title: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  coaching_style?: 'collaborative' | 'analytical' | 'creative';
  cv_analysis?: any;
  questionnaire_data?: any;
  summary_data?: any;
  consultant_notes?: any[];
  package_name?: string;
  package_duration?: number;
  package_price?: number;
  duration_hours?: number;
  start_date?: string;
  end_date?: string;
  consent_data?: any;
  answers?: any[];
  summary?: any;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ChatSession {
  id: string;
  assessment_id: string;
  session_type: 'text' | 'voice';
  messages: any[];
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'client' | 'consultant' | 'admin';
  organization_id?: string;
  created_at: string;
  updated_at: string;
}
