/**
 * Tests du service offlineSyncService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

// Mock localStorage
let store: Record<string, string> = {};
vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => store[key] || null);
vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => { store[key] = value; });
vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => { delete store[key]; });

describe('offlineSyncService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = {};
  });

  describe('module import', () => {
    it('devrait pouvoir importer le module', async () => {
      const module = await import('./offlineSyncService');
      expect(module).toBeDefined();
    });

    it('devrait exporter les fonctions principales', async () => {
      const module = await import('./offlineSyncService');
      expect(module.addToSyncQueue).toBeDefined();
      expect(module.getSyncQueue).toBeDefined();
      expect(module.removeFromSyncQueue).toBeDefined();
      expect(module.saveOfflineAnswers).toBeDefined();
      expect(module.getOfflineAnswers).toBeDefined();
      expect(module.clearOfflineAnswers).toBeDefined();
      expect(module.syncAll).toBeDefined();
      expect(module.hasPendingSync).toBeDefined();
      expect(module.getPendingCount).toBeDefined();
    });

    it('devrait exporter addToSyncQueue comme fonction', async () => {
      const { addToSyncQueue } = await import('./offlineSyncService');
      expect(typeof addToSyncQueue).toBe('function');
    });

    it('devrait exporter getSyncQueue comme fonction', async () => {
      const { getSyncQueue } = await import('./offlineSyncService');
      expect(typeof getSyncQueue).toBe('function');
    });
  });

  describe('getSyncQueue', () => {
    it('devrait retourner un tableau', async () => {
      const { getSyncQueue } = await import('./offlineSyncService');
      const queue = getSyncQueue();
      expect(Array.isArray(queue)).toBe(true);
    });

    it('devrait retourner un tableau vide par défaut', async () => {
      const { getSyncQueue } = await import('./offlineSyncService');
      const queue = getSyncQueue();
      expect(queue).toHaveLength(0);
    });
  });

  describe('addToSyncQueue', () => {
    it('devrait être une fonction', async () => {
      const { addToSyncQueue } = await import('./offlineSyncService');
      expect(typeof addToSyncQueue).toBe('function');
    });

    it('devrait accepter un item', async () => {
      const { addToSyncQueue } = await import('./offlineSyncService');
      expect(() => addToSyncQueue({ type: 'test', data: {} })).not.toThrow();
    });

    it('devrait sauvegarder dans localStorage', async () => {
      const { addToSyncQueue } = await import('./offlineSyncService');
      addToSyncQueue({ type: 'test', data: { id: '1' } });
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('removeFromSyncQueue', () => {
    it('devrait être une fonction', async () => {
      const { removeFromSyncQueue } = await import('./offlineSyncService');
      expect(typeof removeFromSyncQueue).toBe('function');
    });

    it('devrait accepter un id', async () => {
      const { removeFromSyncQueue } = await import('./offlineSyncService');
      expect(() => removeFromSyncQueue('test-id')).not.toThrow();
    });
  });

  describe('saveOfflineAnswers', () => {
    it('devrait être une fonction', async () => {
      const { saveOfflineAnswers } = await import('./offlineSyncService');
      expect(typeof saveOfflineAnswers).toBe('function');
    });

    it('devrait accepter des réponses', async () => {
      const { saveOfflineAnswers } = await import('./offlineSyncService');
      const answers = { assessmentId: 'test', answers: [] };
      expect(() => saveOfflineAnswers(answers)).not.toThrow();
    });

    it('devrait sauvegarder dans localStorage', async () => {
      const { saveOfflineAnswers } = await import('./offlineSyncService');
      saveOfflineAnswers({ assessmentId: 'test', answers: [] });
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('getOfflineAnswers', () => {
    it('devrait retourner null ou un objet', async () => {
      const { getOfflineAnswers } = await import('./offlineSyncService');
      const answers = getOfflineAnswers();
      expect(answers === null || typeof answers === 'object').toBe(true);
    });

    it('devrait retourner null par défaut', async () => {
      const { getOfflineAnswers } = await import('./offlineSyncService');
      const answers = getOfflineAnswers();
      expect(answers).toBeNull();
    });

    it('devrait lire depuis localStorage', async () => {
      const { getOfflineAnswers } = await import('./offlineSyncService');
      getOfflineAnswers();
      expect(localStorage.getItem).toHaveBeenCalled();
    });
  });

  describe('clearOfflineAnswers', () => {
    it('devrait être une fonction', async () => {
      const { clearOfflineAnswers } = await import('./offlineSyncService');
      expect(typeof clearOfflineAnswers).toBe('function');
    });

    it('devrait s\'exécuter sans erreur', async () => {
      const { clearOfflineAnswers } = await import('./offlineSyncService');
      expect(() => clearOfflineAnswers()).not.toThrow();
    });

    it('devrait supprimer de localStorage', async () => {
      const { clearOfflineAnswers } = await import('./offlineSyncService');
      clearOfflineAnswers();
      expect(localStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('hasPendingSync', () => {
    it('devrait retourner un booléen', async () => {
      const { hasPendingSync } = await import('./offlineSyncService');
      const result = hasPendingSync();
      expect(typeof result).toBe('boolean');
    });

    it('devrait retourner false par défaut', async () => {
      const { hasPendingSync } = await import('./offlineSyncService');
      const result = hasPendingSync();
      expect(result).toBe(false);
    });
  });

  describe('getPendingCount', () => {
    it('devrait retourner un nombre', async () => {
      const { getPendingCount } = await import('./offlineSyncService');
      const count = getPendingCount();
      expect(typeof count).toBe('number');
    });

    it('devrait retourner 0 par défaut', async () => {
      const { getPendingCount } = await import('./offlineSyncService');
      const count = getPendingCount();
      expect(count).toBe(0);
    });

    it('devrait être >= 0', async () => {
      const { getPendingCount } = await import('./offlineSyncService');
      const count = getPendingCount();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('syncAll', () => {
    it('devrait retourner un objet avec success et failed', async () => {
      const { syncAll } = await import('./offlineSyncService');
      const result = await syncAll();
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('failed');
    });

    it('devrait retourner des nombres', async () => {
      const { syncAll } = await import('./offlineSyncService');
      const result = await syncAll();
      
      expect(typeof result.success).toBe('number');
      expect(typeof result.failed).toBe('number');
    });

    it('devrait être une fonction async', async () => {
      const { syncAll } = await import('./offlineSyncService');
      const result = syncAll();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('edge cases', () => {
    it('devrait gérer des données vides', async () => {
      const { addToSyncQueue } = await import('./offlineSyncService');
      expect(() => addToSyncQueue({ type: '', data: {} })).not.toThrow();
    });

    it('devrait gérer des données complexes', async () => {
      const { saveOfflineAnswers } = await import('./offlineSyncService');
      const complexData = {
        assessmentId: 'test',
        answers: [
          { id: '1', answer: 'Réponse avec caractères spéciaux: éàü' },
          { id: '2', answer: 'Réponse avec\nretour à la ligne' },
        ],
      };
      expect(() => saveOfflineAnswers(complexData)).not.toThrow();
    });
  });
});
