import { supabase } from '../lib/supabaseClient';
import { Answer, CoachingStyle } from '../types';

/**
 * Service de gestion des sessions de bilan - 100% Supabase
 * Remplace complètement localStorage
 */

export interface SessionData {
  id?: string;
  user_id: string;
  app_state: string;
  user_name: string;
  selected_package_id: string | null;
  coaching_style: CoachingStyle;
  current_answers: Answer[];
  start_date: string;
  time_spent: number;
  updated_at: string;
}

/**
 * Sauvegarde la session en cours dans Supabase
 */
export const saveSession = async (userId: string, sessionData: Omit<SessionData, 'user_id' | 'updated_at'>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .upsert({
        user_id: userId,
        app_state: sessionData.app_state,
        user_name: sessionData.user_name,
        selected_package_id: sessionData.selected_package_id,
        coaching_style: sessionData.coaching_style,
        current_answers: sessionData.current_answers,
        start_date: sessionData.start_date,
        time_spent: sessionData.time_spent,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      // Si la table n'existe pas, on ignore silencieusement
      if (!error.message.includes('does not exist')) {
        console.error('[SessionService] Erreur sauvegarde:', error.message);
      }
    }
  } catch (error) {
    console.error('[SessionService] Erreur:', error);
  }
};

/**
 * Charge la session depuis Supabase
 */
export const loadSession = async (userId: string): Promise<SessionData | null> => {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Si pas de session ou table inexistante, retourner null
      return null;
    }

    // Vérifier si la session n'est pas trop ancienne (24h)
    if (data?.updated_at) {
      const lastUpdated = new Date(data.updated_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      if (hoursDiff > 24) {
        await clearSession(userId);
        return null;
      }
    }

    return data as SessionData;
  } catch (error) {
    console.error('[SessionService] Erreur chargement:', error);
    return null;
  }
};

/**
 * Supprime la session de l'utilisateur
 */
export const clearSession = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId);

    if (error && !error.message.includes('does not exist')) {
      console.error('[SessionService] Erreur suppression:', error.message);
    }
  } catch (error) {
    console.error('[SessionService] Erreur:', error);
  }
};
