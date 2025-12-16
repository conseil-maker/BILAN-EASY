import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

interface AutoSaveOptions {
  userId?: string;
  assessmentId?: string;
  packageName?: string;
  userName?: string;
  answers: any[];
  enabled?: boolean;
  interval?: number; // en millisecondes
  onSave?: () => void;
  onError?: (error: any) => void;
}

/**
 * Hook pour sauvegarder automatiquement les réponses du questionnaire
 * @param options Options de configuration
 */
export const useAutoSave = (options: AutoSaveOptions) => {
  const {
    userId,
    assessmentId,
    packageName,
    userName,
    answers,
    enabled = true,
    interval = 5 * 60 * 1000, // 5 minutes par défaut
    onSave,
    onError,
  } = options;

  const lastSavedRef = useRef<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const saveToLocalStorage = useCallback(() => {
    const draft = {
      id: assessmentId || `draft_${Date.now()}`,
      package_name: packageName,
      user_name: userName,
      answers,
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem('currentDraft', JSON.stringify(draft));
    return draft;
  }, [assessmentId, packageName, userName, answers]);

  const saveToSupabase = useCallback(async () => {
    if (!userId || answers.length === 0) return;

    const answersHash = JSON.stringify(answers);
    
    // Ne pas sauvegarder si rien n'a changé
    if (answersHash === lastSavedRef.current) {
      return;
    }

    try {
      const draftId = assessmentId || `draft_${userId}_${Date.now()}`;
      
      const { error } = await supabase
        .from('assessments')
        .upsert({
          id: draftId,
          client_id: userId,
          package_name: packageName,
          status: 'in_progress',
          answers: answers,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Erreur auto-save Supabase:', error);
        onError?.(error);
      } else {
        lastSavedRef.current = answersHash;
        console.log('Auto-save réussi:', new Date().toLocaleTimeString());
        onSave?.();
      }
    } catch (error) {
      console.error('Erreur auto-save:', error);
      onError?.(error);
    }
  }, [userId, assessmentId, packageName, answers, onSave, onError]);

  const save = useCallback(async () => {
    // Toujours sauvegarder dans localStorage
    saveToLocalStorage();
    
    // Sauvegarder dans Supabase si connecté
    if (userId) {
      await saveToSupabase();
    }
  }, [saveToLocalStorage, saveToSupabase, userId]);

  // Auto-save périodique
  useEffect(() => {
    if (!enabled || answers.length === 0) {
      return;
    }

    // Sauvegarder immédiatement dans localStorage
    saveToLocalStorage();

    // Configurer l'intervalle de sauvegarde
    timerRef.current = setInterval(() => {
      save();
    }, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [enabled, answers.length, interval, save, saveToLocalStorage]);

  // Sauvegarder avant de quitter la page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (answers.length > 0) {
        saveToLocalStorage();
        e.preventDefault();
        e.returnValue = 'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [answers.length, saveToLocalStorage]);

  return {
    save,
    saveToLocalStorage,
    saveToSupabase,
  };
};

export default useAutoSave;
