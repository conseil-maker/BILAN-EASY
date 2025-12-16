import { HistoryItem } from "../types";
import { supabase } from "../lib/supabaseClient";

const HISTORY_KEY = 'skillsAssessmentHistory';

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

    // Sauvegarder dans Supabase si userId est fourni
    if (userId) {
      const { error } = await supabase
        .from('assessments')
        .upsert({
          id: item.id,
          client_id: userId,
          package_name: item.packageName,
          package_duration: item.packageDuration || 0,
          package_price: item.packagePrice || 0,
          duration_hours: item.duration || 0,
          start_date: item.date,
          end_date: new Date().toISOString(),
          status: 'completed',
          answers: item.answers || [],
          summary: item.summary || {},
          consent_data: item.consentData || {},
          created_at: item.date,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error("Failed to save assessment to Supabase:", error);
      } else {
        console.log("Assessment saved to Supabase successfully");
      }
    }
  } catch (error) {
    console.error("Failed to save assessment to history:", error);
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
    console.error("Failed to retrieve assessment history from localStorage:", error);
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Failed to retrieve assessment history from Supabase:", error);
      return [];
    }

    // Transformer les données Supabase en format HistoryItem
    return (data || []).map(item => ({
      id: item.id,
      date: item.created_at,
      packageName: item.package_name,
      packageDuration: item.package_duration,
      packagePrice: item.package_price,
      duration: item.duration_hours,
      summary: item.summary,
      answers: item.answers,
      consentData: item.consent_data,
      status: item.status
    }));
  } catch (error) {
    console.error("Failed to retrieve assessment history from Supabase:", error);
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
    console.error("Failed to retrieve assessment history:", error);
    return getAssessmentHistoryLocal();
  }
};

/**
 * Clears the entire assessment history from localStorage.
 */
export const clearAssessmentHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear assessment history:", error);
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
      console.error("Failed to delete assessment from Supabase:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Failed to delete assessment:", error);
    return false;
  }
};
