/**
 * Tests du service historyService
 * 
 * Ce service utilise Supabase pour la persistance des données.
 * Les fonctions localStorage ont été supprimées au profit de Supabase.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
  },
}));

describe('historyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('module import', () => {
    it('devrait pouvoir importer le module', async () => {
      const module = await import('./historyService');
      expect(module).toBeDefined();
    });

    it('devrait exporter les fonctions principales', async () => {
      const module = await import('./historyService');
      expect(module.saveAssessmentToHistory).toBeDefined();
      expect(module.getAssessmentHistoryFromSupabase).toBeDefined();
      expect(module.getAssessmentHistory).toBeDefined();
      expect(module.clearAssessmentHistory).toBeDefined();
      expect(module.deleteAssessmentFromSupabase).toBeDefined();
    });

    it('devrait exporter saveAssessmentToHistory comme fonction', async () => {
      const { saveAssessmentToHistory } = await import('./historyService');
      expect(typeof saveAssessmentToHistory).toBe('function');
    });
  });

  describe('clearAssessmentHistory', () => {
    it('devrait être une fonction', async () => {
      const { clearAssessmentHistory } = await import('./historyService');
      expect(typeof clearAssessmentHistory).toBe('function');
    });

    it('devrait s\'exécuter sans erreur', async () => {
      const { clearAssessmentHistory } = await import('./historyService');
      expect(() => clearAssessmentHistory()).not.toThrow();
    });
  });

  describe('saveAssessmentToHistory', () => {
    it('devrait être une fonction async', async () => {
      const { saveAssessmentToHistory } = await import('./historyService');
      expect(typeof saveAssessmentToHistory).toBe('function');
    });

    it('devrait accepter un objet assessment', async () => {
      const { saveAssessmentToHistory } = await import('./historyService');
      const assessment = {
        id: 'test-1',
        package_name: 'Essentiel',
        status: 'completed',
        answers: [],
      };
      
      await expect(saveAssessmentToHistory(assessment)).resolves.not.toThrow();
    });

    it('devrait être une fonction async qui retourne une Promise', async () => {
      const { saveAssessmentToHistory } = await import('./historyService');
      const assessment = {
        id: 'test-2',
        package_name: 'Approfondi',
        status: 'completed',
        answers: [],
      };
      
      const result = saveAssessmentToHistory(assessment);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('getAssessmentHistory', () => {
    it('devrait retourner un tableau', async () => {
      const { getAssessmentHistory } = await import('./historyService');
      const history = await getAssessmentHistory();
      expect(Array.isArray(history)).toBe(true);
    });

    it('devrait être une fonction async', async () => {
      const { getAssessmentHistory } = await import('./historyService');
      const result = getAssessmentHistory();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('getAssessmentHistoryFromSupabase', () => {
    it('devrait retourner un tableau', async () => {
      const { getAssessmentHistoryFromSupabase } = await import('./historyService');
      const history = await getAssessmentHistoryFromSupabase('test-user');
      expect(Array.isArray(history)).toBe(true);
    });

    it('devrait accepter un userId', async () => {
      const { getAssessmentHistoryFromSupabase } = await import('./historyService');
      await expect(getAssessmentHistoryFromSupabase('user-123')).resolves.not.toThrow();
    });

    it('devrait être une fonction async', async () => {
      const { getAssessmentHistoryFromSupabase } = await import('./historyService');
      const result = getAssessmentHistoryFromSupabase('test-user');
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('deleteAssessmentFromSupabase', () => {
    it('devrait retourner un booléen', async () => {
      const { deleteAssessmentFromSupabase } = await import('./historyService');
      const result = await deleteAssessmentFromSupabase('test-id');
      expect(typeof result).toBe('boolean');
    });

    it('devrait accepter un assessmentId', async () => {
      const { deleteAssessmentFromSupabase } = await import('./historyService');
      await expect(deleteAssessmentFromSupabase('assessment-123')).resolves.not.toThrow();
    });

    it('devrait être une fonction async', async () => {
      const { deleteAssessmentFromSupabase } = await import('./historyService');
      const result = deleteAssessmentFromSupabase('test-id');
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('edge cases', () => {
    it('devrait gérer un userId vide', async () => {
      const { getAssessmentHistoryFromSupabase } = await import('./historyService');
      await expect(getAssessmentHistoryFromSupabase('')).resolves.not.toThrow();
    });

    it('devrait gérer un assessmentId vide', async () => {
      const { deleteAssessmentFromSupabase } = await import('./historyService');
      await expect(deleteAssessmentFromSupabase('')).resolves.not.toThrow();
    });

    it('devrait gérer un assessment avec des données minimales', async () => {
      const { saveAssessmentToHistory } = await import('./historyService');
      const minimalAssessment = { id: 'min-1' };
      
      await expect(saveAssessmentToHistory(minimalAssessment as any)).resolves.not.toThrow();
    });
  });
});
