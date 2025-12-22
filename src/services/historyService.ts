import { HistoryItem, Answer, Summary } from "../types";
import { supabase, Assessment } from "../lib/supabaseClient";

const HISTORY_KEY = 'skillsAssessmentHistory';

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
 * Convertit un HistoryItem en format Assessment pour Supabase
 */
const historyItemToAssessment = (item: HistoryItem, userId: string): Partial<Assessment> => {
  return {
    id: item.id.includes('-') ? item.id : generateUUID(), // Utiliser UUID si l'ID n'est pas déjà un UUID
    client_id: userId,
    title: `Bilan ${item.userName} - ${item.packageName}`,
    package_name: item.packageName,
    status: 'completed',
    answers: item.answers || [],
    summary: item.summary || {},
    created_at: item.date,
    updated_at: new Date().toISOString(),
    completed_at: new Date().toISOString()
  };
};

/**
 * Convertit un Assessment Supabase en HistoryItem
 */
const assessmentToHistoryItem = (assessment: Assessment): HistoryItem => {
  // Extraire le nom d'utilisateur du titre si possible
  const titleMatch = assessment.title?.match(/Bilan (.+?) - /);
  const userName = titleMatch ? titleMatch[1] : 'Utilisateur';
  
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
 * Saves an assessment result to both Supabase and localStorage.
 * @param item The history item to save.
 * @param userId The user ID for Supabase storage.
 */
export const saveAssessmentToHistory = async (item: HistoryItem, userId?: string): Promise<void> => {
  try {
    // Sauvegarder dans localStorage (backup local)
    const history = getAssessmentHistoryLocal();
    history.unshift(item);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    console.log("[HistoryService] Sauvegardé dans localStorage");

    // Sauvegarder dans Supabase si userId est fourni
    if (userId) {
      const assessmentData = historyItemToAssessment(item, userId);
      
      const { data, error } = await supabase
        .from('assessments')
        .upsert(assessmentData, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) {
        console.error("[HistoryService] Erreur Supabase:", error.message, error.details);
        // Essayer avec un nouvel UUID si l'erreur est liée à l'ID
        if (error.message.includes('uuid') || error.message.includes('id')) {
          const newAssessmentData = { ...assessmentData, id: generateUUID() };
          const { error: retryError } = await supabase
            .from('assessments')
            .insert(newAssessmentData);
          
          if (retryError) {
            console.error("[HistoryService] Erreur Supabase (retry):", retryError);
          } else {
            console.log("[HistoryService] Sauvegardé dans Supabase (avec nouvel UUID)");
          }
        }
      } else {
        console.log("[HistoryService] Sauvegardé dans Supabase:", data?.id);
      }
    }
  } catch (error) {
    console.error("[HistoryService] Erreur lors de la sauvegarde:", error);
  }
};

/**
 * Retrieves assessment history from localStorage only (for offline access).
 * @returns An array of history items from localStorage.
 */
export const getAssessmentHistoryLocal = (): HistoryItem[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error("[HistoryService] Erreur localStorage:", error);
    return [];
  }
};

/**
 * Retrieves assessment history from Supabase.
 * @param userId The user ID to fetch history for.
 * @returns An array of history items from Supabase.
 */
export const getAssessmentHistoryFromSupabase = async (userId: string): Promise<HistoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('client_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("[HistoryService] Erreur récupération Supabase:", error);
      return [];
    }

    // Transformer les données Supabase en format HistoryItem
    return (data || []).map(assessmentToHistoryItem);
  } catch (error) {
    console.error("[HistoryService] Erreur récupération Supabase:", error);
    return [];
  }
};

/**
 * Retrieves all assessment results, merging Supabase and localStorage.
 * Supabase data takes priority.
 * @param userId The user ID to fetch history for.
 * @returns An array of history items.
 */
export const getAssessmentHistory = async (userId?: string): Promise<HistoryItem[]> => {
  try {
    // Récupérer depuis localStorage
    const localHistory = getAssessmentHistoryLocal();

    // Si pas de userId, retourner uniquement le localStorage
    if (!userId) {
      return localHistory;
    }

    // Récupérer depuis Supabase
    const supabaseHistory = await getAssessmentHistoryFromSupabase(userId);

    // Fusionner les deux, Supabase prioritaire
    const mergedHistory = [...supabaseHistory];
    const supabaseIds = new Set(supabaseHistory.map(item => item.id));

    // Ajouter les éléments locaux qui ne sont pas dans Supabase
    localHistory.forEach(item => {
      if (!supabaseIds.has(item.id)) {
        mergedHistory.push(item);
      }
    });

    // Trier par date décroissante
    return mergedHistory.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error("[HistoryService] Erreur fusion historique:", error);
    return getAssessmentHistoryLocal();
  }
};

/**
 * Clears the entire assessment history from localStorage.
 */
export const clearAssessmentHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_KEY);
    console.log("[HistoryService] Historique local effacé");
  } catch (error) {
    console.error("[HistoryService] Erreur effacement:", error);
  }
};

/**
 * Deletes an assessment from Supabase.
 * @param assessmentId The assessment ID to delete.
 */
export const deleteAssessmentFromSupabase = async (assessmentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('assessments')
      .delete()
      .eq('id', assessmentId);

    if (error) {
      console.error("[HistoryService] Erreur suppression Supabase:", error);
      return false;
    }
    console.log("[HistoryService] Assessment supprimé de Supabase:", assessmentId);
    return true;
  } catch (error) {
    console.error("[HistoryService] Erreur suppression:", error);
    return false;
  }
};

/**
 * Synchronise les bilans locaux vers Supabase
 * @param userId The user ID for Supabase storage.
 */
export const syncLocalToSupabase = async (userId: string): Promise<number> => {
  try {
    const localHistory = getAssessmentHistoryLocal();
    const supabaseHistory = await getAssessmentHistoryFromSupabase(userId);
    const supabaseIds = new Set(supabaseHistory.map(item => item.id));
    
    let syncedCount = 0;
    
    for (const item of localHistory) {
      if (!supabaseIds.has(item.id)) {
        const assessmentData = historyItemToAssessment(item, userId);
        const { error } = await supabase
          .from('assessments')
          .insert(assessmentData);
        
        if (!error) {
          syncedCount++;
          console.log("[HistoryService] Synchronisé:", item.id);
        }
      }
    }
    
    console.log(`[HistoryService] ${syncedCount} bilans synchronisés vers Supabase`);
    return syncedCount;
  } catch (error) {
    console.error("[HistoryService] Erreur synchronisation:", error);
    return 0;
  }
};
