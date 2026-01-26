import { supabase } from '../lib/supabaseClient';
import { Answer, CoachingStyle } from '../types';
import { handleError, handleNetworkError, ErrorCategory } from './errorService';

/**
 * Service de gestion des sessions de bilan - 100% Supabase
 * Remplace complètement localStorage
 * Sauvegarde les questions ET les réponses pour permettre une reprise complète
 */

export interface QuestionData {
  id: string;
  text: string;
  phase: string;
  theme?: string;
  timestamp: string;
}

export interface SessionData {
  id?: string;
  user_id: string;
  app_state: string;
  user_name: string;
  selected_package_id: string | null;
  coaching_style: CoachingStyle;
  current_answers: Answer[];
  current_questions: QuestionData[];
  last_ai_message?: string; // Dernière question posée par l'IA (pour reprise exacte)
  current_phase: string;
  progress: number;
  start_date: string;
  time_spent: number;
  consent_data?: any;
  user_profile?: any;
  updated_at: string;
}

/**
 * Sauvegarde la session en cours dans Supabase
 */
export const saveSession = async (
  userId: string, 
  sessionData: Omit<SessionData, 'user_id' | 'updated_at'>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .upsert({
        user_id: userId,
        app_state: sessionData.app_state,
        user_name: sessionData.user_name,
        selected_package_id: sessionData.selected_package_id,
        coaching_style: sessionData.coaching_style,
        current_answers: sessionData.current_answers || [],
        current_questions: sessionData.current_questions || [],
        last_ai_message: sessionData.last_ai_message || null,
        current_phase: sessionData.current_phase || 'preliminary',
        progress: sessionData.progress || 0,
        start_date: sessionData.start_date,
        time_spent: sessionData.time_spent,
        consent_data: sessionData.consent_data || null,
        user_profile: sessionData.user_profile || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      // Si la table n'existe pas ou colonnes manquantes, on ignore silencieusement
      if (!error.message.includes('does not exist') && !error.message.includes('column')) {
        handleError(error, 'SessionService.saveSession', {
          category: 'storage' as ErrorCategory,
          showToast: false // Ne pas afficher de toast pour les erreurs de sauvegarde silencieuses
        });
      }
    }
  } catch (error) {
    handleNetworkError(error, 'SessionService.saveSession', { showToast: false });
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

    // Vérifier si la session n'est pas trop ancienne (7 jours)
    // Un bilan de compétences peut s'étaler sur plusieurs jours
    if (data?.updated_at) {
      const lastUpdated = new Date(data.updated_at);
      const now = new Date();
      const daysDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 7) {
        await clearSession(userId);
        return null;
      }
    }

    // S'assurer que les tableaux sont initialisés
    return {
      ...data,
      current_answers: data.current_answers || [],
      current_questions: data.current_questions || [],
    } as SessionData;
  } catch (error) {
    handleNetworkError(error, 'SessionService.loadSession', { showToast: false });
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
      handleError(error, 'SessionService.clearSession', {
        category: 'storage' as ErrorCategory,
        showToast: false
      });
    }
  } catch (error) {
    handleNetworkError(error, 'SessionService.clearSession', { showToast: false });
  }
};

/**
 * Met à jour uniquement les questions et réponses (pour éviter de tout sauvegarder à chaque fois)
 */
export const updateSessionProgress = async (
  userId: string,
  questions: QuestionData[],
  answers: Answer[],
  progress: number,
  timeSpent: number,
  currentPhase: string,
  lastAiMessage?: string
): Promise<void> => {
  try {
    const updateData: any = {
      current_questions: questions,
      current_answers: answers,
      progress: progress,
      time_spent: timeSpent,
      current_phase: currentPhase,
      updated_at: new Date().toISOString()
    };
    
    // Ajouter last_ai_message seulement s'il est fourni
    if (lastAiMessage !== undefined) {
      updateData.last_ai_message = lastAiMessage;
    }
    
    const { error } = await supabase
      .from('user_sessions')
      .update(updateData)
      .eq('user_id', userId);

    if (error && !error.message.includes('does not exist') && !error.message.includes('column')) {
      handleError(error, 'SessionService.updateSessionProgress', {
        category: 'storage' as ErrorCategory,
        showToast: false
      });
    }
  } catch (error) {
    handleNetworkError(error, 'SessionService.updateSessionProgress', { showToast: false });
  }
};
