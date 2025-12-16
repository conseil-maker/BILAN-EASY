/**
 * Service de synchronisation des données hors-ligne
 * Gère la persistance locale et la synchronisation avec Supabase
 */

import { supabase } from '../lib/supabaseClient';

const SYNC_QUEUE_KEY = 'bilan-easy-sync-queue';
const OFFLINE_ANSWERS_KEY = 'bilan-easy-offline-answers';

interface SyncItem {
  id: string;
  type: 'assessment' | 'answer' | 'satisfaction';
  data: any;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

interface OfflineAnswers {
  assessmentId: string;
  userId: string;
  packageName: string;
  answers: any[];
  lastUpdated: number;
}

/**
 * Ajouter un élément à la file de synchronisation
 */
export const addToSyncQueue = (type: SyncItem['type'], data: any): void => {
  const queue = getSyncQueue();
  const item: SyncItem = {
    id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    timestamp: Date.now(),
    retryCount: 0,
  };
  queue.push(item);
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
};

/**
 * Récupérer la file de synchronisation
 */
export const getSyncQueue = (): SyncItem[] => {
  try {
    const stored = localStorage.getItem(SYNC_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Supprimer un élément de la file
 */
export const removeFromSyncQueue = (id: string): void => {
  const queue = getSyncQueue().filter(item => item.id !== id);
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
};

/**
 * Mettre à jour un élément dans la file
 */
export const updateSyncItem = (id: string, updates: Partial<SyncItem>): void => {
  const queue = getSyncQueue();
  const index = queue.findIndex(item => item.id === id);
  if (index >= 0) {
    queue[index] = { ...queue[index], ...updates };
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }
};

/**
 * Sauvegarder les réponses hors-ligne
 */
export const saveOfflineAnswers = (
  assessmentId: string,
  userId: string,
  packageName: string,
  answers: any[]
): void => {
  const data: OfflineAnswers = {
    assessmentId,
    userId,
    packageName,
    answers,
    lastUpdated: Date.now(),
  };
  localStorage.setItem(OFFLINE_ANSWERS_KEY, JSON.stringify(data));
};

/**
 * Récupérer les réponses hors-ligne
 */
export const getOfflineAnswers = (): OfflineAnswers | null => {
  try {
    const stored = localStorage.getItem(OFFLINE_ANSWERS_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Effacer les réponses hors-ligne
 */
export const clearOfflineAnswers = (): void => {
  localStorage.removeItem(OFFLINE_ANSWERS_KEY);
};

/**
 * Synchroniser un élément avec Supabase
 */
const syncItem = async (item: SyncItem): Promise<boolean> => {
  try {
    switch (item.type) {
      case 'assessment':
        const { error: assessmentError } = await supabase
          .from('assessments')
          .upsert({
            id: item.data.id,
            client_id: item.data.userId,
            package_name: item.data.packageName,
            status: item.data.status,
            answers: item.data.answers,
            updated_at: new Date().toISOString(),
          });
        if (assessmentError) throw assessmentError;
        break;

      case 'satisfaction':
        const { error: satisfactionError } = await supabase
          .from('satisfaction_surveys')
          .insert(item.data);
        if (satisfactionError) throw satisfactionError;
        break;

      default:
        console.warn('[Sync] Type inconnu:', item.type);
        return false;
    }

    console.log('[Sync] Synchronisé avec succès:', item.id);
    return true;
  } catch (error) {
    console.error('[Sync] Erreur:', item.id, error);
    return false;
  }
};

/**
 * Synchroniser toute la file d'attente
 */
export const syncAll = async (): Promise<{ success: number; failed: number }> => {
  const queue = getSyncQueue();
  let success = 0;
  let failed = 0;

  for (const item of queue) {
    if (item.retryCount >= 3) {
      // Trop de tentatives, abandonner
      console.warn('[Sync] Abandon après 3 tentatives:', item.id);
      removeFromSyncQueue(item.id);
      failed++;
      continue;
    }

    const result = await syncItem(item);
    if (result) {
      removeFromSyncQueue(item.id);
      success++;
    } else {
      updateSyncItem(item.id, {
        retryCount: item.retryCount + 1,
        lastError: 'Échec de synchronisation',
      });
      failed++;
    }
  }

  // Synchroniser aussi les réponses hors-ligne
  const offlineAnswers = getOfflineAnswers();
  if (offlineAnswers) {
    try {
      const { error } = await supabase
        .from('assessments')
        .upsert({
          id: offlineAnswers.assessmentId,
          client_id: offlineAnswers.userId,
          package_name: offlineAnswers.packageName,
          status: 'in_progress',
          answers: offlineAnswers.answers,
          updated_at: new Date().toISOString(),
        });

      if (!error) {
        clearOfflineAnswers();
        success++;
        console.log('[Sync] Réponses hors-ligne synchronisées');
      } else {
        failed++;
        console.error('[Sync] Erreur réponses hors-ligne:', error);
      }
    } catch (error) {
      failed++;
      console.error('[Sync] Erreur réponses hors-ligne:', error);
    }
  }

  return { success, failed };
};

/**
 * Vérifier si des données sont en attente de synchronisation
 */
export const hasPendingSync = (): boolean => {
  const queue = getSyncQueue();
  const offlineAnswers = getOfflineAnswers();
  return queue.length > 0 || offlineAnswers !== null;
};

/**
 * Obtenir le nombre d'éléments en attente
 */
export const getPendingCount = (): number => {
  const queue = getSyncQueue();
  const offlineAnswers = getOfflineAnswers();
  return queue.length + (offlineAnswers ? 1 : 0);
};

export default {
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  saveOfflineAnswers,
  getOfflineAnswers,
  clearOfflineAnswers,
  syncAll,
  hasPendingSync,
  getPendingCount,
};
