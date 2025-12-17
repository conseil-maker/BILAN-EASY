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

describe('offlineSyncService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
  });

  describe('getSyncQueue', () => {
    it('devrait retourner un tableau', async () => {
      const { getSyncQueue } = await import('./offlineSyncService');
      const queue = getSyncQueue();
      expect(Array.isArray(queue)).toBe(true);
    });
  });

  describe('addToSyncQueue', () => {
    it('devrait être une fonction', async () => {
      const { addToSyncQueue } = await import('./offlineSyncService');
      expect(typeof addToSyncQueue).toBe('function');
    });
  });

  describe('removeFromSyncQueue', () => {
    it('devrait être une fonction', async () => {
      const { removeFromSyncQueue } = await import('./offlineSyncService');
      expect(typeof removeFromSyncQueue).toBe('function');
    });
  });

  describe('saveOfflineAnswers', () => {
    it('devrait être une fonction', async () => {
      const { saveOfflineAnswers } = await import('./offlineSyncService');
      expect(typeof saveOfflineAnswers).toBe('function');
    });
  });

  describe('getOfflineAnswers', () => {
    it('devrait retourner null ou un objet', async () => {
      const { getOfflineAnswers } = await import('./offlineSyncService');
      const answers = getOfflineAnswers();
      expect(answers === null || typeof answers === 'object').toBe(true);
    });
  });

  describe('clearOfflineAnswers', () => {
    it('devrait être une fonction', async () => {
      const { clearOfflineAnswers } = await import('./offlineSyncService');
      expect(typeof clearOfflineAnswers).toBe('function');
    });
  });

  describe('hasPendingSync', () => {
    it('devrait retourner un booléen', async () => {
      const { hasPendingSync } = await import('./offlineSyncService');
      const result = hasPendingSync();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getPendingCount', () => {
    it('devrait retourner un nombre', async () => {
      const { getPendingCount } = await import('./offlineSyncService');
      const count = getPendingCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('syncAll', () => {
    it('devrait retourner un objet avec success et failed', async () => {
      const { syncAll } = await import('./offlineSyncService');
      const result = await syncAll();
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('failed');
      expect(typeof result.success).toBe('number');
      expect(typeof result.failed).toBe('number');
    });
  });
});
