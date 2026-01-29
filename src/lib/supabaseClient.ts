import { createClient } from '@supabase/supabase-js';

// Variables d'environnement Supabase (configurées dans Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Variables d\'environnement manquantes. Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
}

// Configuration simplifiée pour la persistance de session
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Activer la persistance de session dans localStorage
    persistSession: true,
    // Rafraîchir automatiquement le token avant expiration
    autoRefreshToken: true,
    // Détecter automatiquement les changements de session dans d'autres onglets
    detectSessionInUrl: true,
  },
});

// Fonction utilitaire pour vérifier et rafraîchir la session
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('[Supabase] Erreur lors du rafraîchissement de la session:', error);
      return null;
    }
    return data.session;
  } catch (err) {
    console.error('[Supabase] Exception lors du rafraîchissement:', err);
    return null;
  }
};

// Fonction pour vérifier si la session est valide
export const isSessionValid = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      return false;
    }
    // Vérifier si le token expire dans moins de 5 minutes
    const expiresAt = session.expires_at;
    if (expiresAt) {
      const now = Math.floor(Date.now() / 1000);
      const fiveMinutes = 5 * 60;
      if (expiresAt - now < fiveMinutes) {
        // Rafraîchir la session si elle expire bientôt
        const refreshedSession = await refreshSession();
        return !!refreshedSession;
      }
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Erreur de vérification de session:', err);
    return false;
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
