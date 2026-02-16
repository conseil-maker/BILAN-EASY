import { HistoryItem } from "../types";
import { supabase, Assessment } from "../lib/supabaseClient";
import { handleError, handleNetworkError, ErrorCategory } from './errorService';

/**
 * Service de gestion de l'historique des bilans - 100% Supabase
 * Pas de localStorage car l'application nécessite une connexion internet pour Gemini AI
 */

/**
 * Génère un UUID v4 compatible avec Supabase
 */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Convertit un Assessment Supabase en HistoryItem
 */
const assessmentToHistoryItem = (assessment: Assessment): HistoryItem => {
  const titleMatch = assessment.title?.match(/Bilan (.+?) - /);
  const userName: string = titleMatch?.[1] || 'Utilisateur';
  
  return {
    id: assessment.id,
    date: assessment.created_at,
    userName: userName,
    packageName: assessment.package_name || 'Forfait Standard',
    summary: assessment.summary || {
      profileType: '',
      priorityThemes: [],
      maturityLevel: '',
      keyStrengths: [],
      areasForDevelopment: [],
      recommendations: [],
      actionPlan: { shortTerm: [], mediumTerm: [] }
    },
    answers: assessment.answers || []
  };
};

/**
 * Sauvegarde un bilan dans Supabase
 */
export const saveAssessmentToHistory = async (item: HistoryItem, userId?: string): Promise<void> => {
  if (!userId) {
    console.error("[HistoryService] userId requis pour sauvegarder dans Supabase");
    return;
  }

  try {
    const assessmentId = item.id.includes('-') ? item.id : generateUUID();
    
    const { data, error } = await supabase
      .from('assessments')
      .upsert({
        id: assessmentId,
        client_id: userId,
        title: `Bilan ${item.userName} - ${item.packageName}`,
        package_name: item.packageName,
        status: 'completed',
        answers: item.answers || [],
        summary: item.summary || {},
        created_at: item.date,
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      handleError(error, 'HistoryService.saveAssessmentToHistory', {
        category: 'storage' as ErrorCategory,
        showToast: true,
        userMessage: 'Erreur lors de la sauvegarde de votre bilan'
      });
      throw error;
    }
    
    // Bilan sauvegardé avec succès
  } catch (error) {
    handleNetworkError(error, 'HistoryService.saveAssessmentToHistory', {
      showToast: true,
      userMessage: 'Erreur de connexion lors de la sauvegarde'
    });
    throw error;
  }
};

/**
 * Récupère l'historique des bilans depuis Supabase
 */
export const getAssessmentHistory = async (userId?: string): Promise<HistoryItem[]> => {
  if (!userId) {
    console.warn("[HistoryService] userId requis pour récupérer l'historique");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('client_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      handleError(error, 'HistoryService.getAssessmentHistory', {
        category: 'storage' as ErrorCategory,
        showToast: false
      });
      throw error;
    }

    return (data || []).map(assessmentToHistoryItem);
  } catch (error) {
    handleNetworkError(error, 'HistoryService.getAssessmentHistory', { showToast: false });
    return [];
  }
};

/**
 * Alias pour compatibilité - redirige vers getAssessmentHistory
 */
export const getAssessmentHistoryFromSupabase = getAssessmentHistory;

/**
 * Supprime un bilan de Supabase
 */
export const deleteAssessmentFromSupabase = async (assessmentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('assessments')
      .delete()
      .eq('id', assessmentId);

    if (error) {
      handleError(error, 'HistoryService.deleteAssessmentFromSupabase', {
        category: 'storage' as ErrorCategory,
        showToast: true,
        userMessage: 'Erreur lors de la suppression du bilan'
      });
      return false;
    }
    
    // Bilan supprimé avec succès
    return true;
  } catch (error) {
    handleNetworkError(error, 'HistoryService.deleteAssessmentFromSupabase', { showToast: true });
    return false;
  }
};

/**
 * Sauvegarde un bilan en cours (brouillon)
 */
export const saveInProgressAssessment = async (
  userId: string,
  assessmentId: string,
  data: {
    userName: string;
    packageName: string;
    answers: any[];
    currentQuestion?: any;
    messages?: any[];
    timeConsumed?: number;
    phase?: string;
  }
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('assessments')
      .upsert({
        id: assessmentId,
        client_id: userId,
        title: `Bilan ${data.userName} - ${data.packageName}`,
        package_name: data.packageName,
        status: 'in_progress',
        answers: data.answers || [],
        current_state: {
          currentQuestion: data.currentQuestion,
          messages: data.messages,
          timeConsumed: data.timeConsumed,
          phase: data.phase,
        },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (error) {
      handleError(error, 'HistoryService.saveInProgressAssessment', {
        category: 'storage' as ErrorCategory,
        showToast: false
      });
      throw error;
    }
  } catch (error) {
    handleNetworkError(error, 'HistoryService.saveInProgressAssessment', { showToast: false });
  }
};

/**
 * Récupère le bilan en cours d'un utilisateur
 */
export const getInProgressAssessment = async (userId: string): Promise<{
  id: string;
  userName: string;
  packageName: string;
  answers: any[];
  currentState: any;
  updatedAt: string;
} | null> => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('client_id', userId)
      .eq('status', 'in_progress')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    const titleMatch = data.title?.match(/Bilan (.+?) - /);
    const userName = titleMatch ? titleMatch[1] : 'Utilisateur';

    return {
      id: data.id,
      userName,
      packageName: data.package_name || 'Forfait Standard',
      answers: data.answers || [],
      currentState: data.current_state || {},
      updatedAt: data.updated_at,
    };
  } catch (error) {
    handleNetworkError(error, 'HistoryService.getInProgressAssessment', { showToast: false });
    return null;
  }
};

/**
 * Récupère le dernier bilan complété d'un utilisateur
 */
export const getLatestCompletedAssessment = async (userId: string): Promise<HistoryItem | null> => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('client_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return assessmentToHistoryItem(data);
  } catch (error) {
    handleNetworkError(error, 'HistoryService.getLatestCompletedAssessment', { showToast: false });
    return null;
  }
};

/**
 * Efface l'historique - non implémenté car dangereux
 * Les suppressions doivent être faites individuellement
 */
export const clearAssessmentHistory = (): void => {
  console.warn("[HistoryService] clearAssessmentHistory non implémenté - utilisez deleteAssessmentFromSupabase");
};
