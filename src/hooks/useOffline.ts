import { useState, useEffect, useCallback } from 'react';

interface OfflineData {
  key: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

interface UseOfflineReturn {
  isOnline: boolean;
  isServiceWorkerReady: boolean;
  pendingSyncCount: number;
  saveOffline: (key: string, data: any) => Promise<void>;
  getOffline: (key: string) => any | null;
  getAllPending: () => OfflineData[];
  clearPending: () => void;
  syncNow: () => Promise<boolean>;
}

const OFFLINE_STORAGE_KEY = 'bilan-easy-offline-data';

/**
 * Hook pour gérer le mode hors-ligne
 */
export const useOffline = (): UseOfflineReturn => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // Écouter les changements de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Tenter une synchronisation automatique
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enregistrer le Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[Offline] Service Worker enregistré:', registration.scope);
          setIsServiceWorkerReady(true);

          // Écouter les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[Offline] Nouvelle version disponible');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[Offline] Erreur d\'enregistrement du Service Worker:', error);
        });
    }
  }, []);

  // Compter les données en attente de synchronisation
  useEffect(() => {
    const count = getAllPending().filter(d => !d.synced).length;
    setPendingSyncCount(count);
  }, []);

  // Récupérer toutes les données stockées
  const getAllOfflineData = useCallback((): OfflineData[] => {
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[Offline] Erreur lecture localStorage:', error);
      return [];
    }
  }, []);

  // Sauvegarder toutes les données
  const setAllOfflineData = useCallback((data: OfflineData[]) => {
    try {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(data));
      setPendingSyncCount(data.filter(d => !d.synced).length);
    } catch (error) {
      console.error('[Offline] Erreur écriture localStorage:', error);
    }
  }, []);

  // Sauvegarder des données hors-ligne
  const saveOffline = useCallback(async (key: string, data: any): Promise<void> => {
    const allData = getAllOfflineData();
    const existingIndex = allData.findIndex(d => d.key === key);
    
    const newEntry: OfflineData = {
      key,
      data,
      timestamp: Date.now(),
      synced: false,
    };

    if (existingIndex >= 0) {
      allData[existingIndex] = newEntry;
    } else {
      allData.push(newEntry);
    }

    setAllOfflineData(allData);
    console.log('[Offline] Données sauvegardées:', key);
  }, [getAllOfflineData, setAllOfflineData]);

  // Récupérer des données hors-ligne
  const getOffline = useCallback((key: string): any | null => {
    const allData = getAllOfflineData();
    const entry = allData.find(d => d.key === key);
    return entry ? entry.data : null;
  }, [getAllOfflineData]);

  // Récupérer toutes les données en attente
  const getAllPending = useCallback((): OfflineData[] => {
    return getAllOfflineData().filter(d => !d.synced);
  }, [getAllOfflineData]);

  // Effacer les données en attente
  const clearPending = useCallback(() => {
    const allData = getAllOfflineData().filter(d => d.synced);
    setAllOfflineData(allData);
  }, [getAllOfflineData, setAllOfflineData]);

  // Synchroniser maintenant
  const syncNow = useCallback(async (): Promise<boolean> => {
    if (!isOnline) {
      console.log('[Offline] Impossible de synchroniser: hors-ligne');
      return false;
    }

    const pending = getAllPending();
    if (pending.length === 0) {
      console.log('[Offline] Rien à synchroniser');
      return true;
    }

    console.log('[Offline] Synchronisation de', pending.length, 'éléments...');
    
    const allData = getAllOfflineData();
    let success = true;

    for (const item of pending) {
      try {
        // Marquer comme synchronisé (dans une vraie app, on enverrait au serveur)
        const index = allData.findIndex(d => d.key === item.key);
        if (index >= 0) {
          allData[index].synced = true;
        }
        console.log('[Offline] Synchronisé:', item.key);
      } catch (error) {
        console.error('[Offline] Erreur synchronisation:', item.key, error);
        success = false;
      }
    }

    setAllOfflineData(allData);
    return success;
  }, [isOnline, getAllPending, getAllOfflineData, setAllOfflineData]);

  return {
    isOnline,
    isServiceWorkerReady,
    pendingSyncCount,
    saveOffline,
    getOffline,
    getAllPending,
    clearPending,
    syncNow,
  };
};

export default useOffline;
