/**
 * Tests du service historyService
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
        })),
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
      expect(module.getAssessmentHistoryLocal).toBeDefined();
      expect(module.getAssessmentHistoryFromSupabase).toBeDefined();
      expect(module.getAssessmentHistory).toBeDefined();
      expect(module.clearAssessmentHistory).toBeDefined();
      expect(module.deleteAssessmentFromSupabase).toBeDefined();
    });
  });

  describe('getAssessmentHistoryLocal', () => {
    it('devrait retourner un tableau', async () => {
      const { getAssessmentHistoryLocal } = await import('./historyService');
      const history = getAssessmentHistoryLocal();
      expect(Array.isArray(history)).toBe(true);
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
  });

  describe('getAssessmentHistory', () => {
    it('devrait retourner un tableau', async () => {
      const { getAssessmentHistory } = await import('./historyService');
      const history = await getAssessmentHistory();
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('getAssessmentHistoryFromSupabase', () => {
    it('devrait retourner un tableau', async () => {
      const { getAssessmentHistoryFromSupabase } = await import('./historyService');
      const history = await getAssessmentHistoryFromSupabase('test-user');
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('deleteAssessmentFromSupabase', () => {
    it('devrait retourner un booléen', async () => {
      const { deleteAssessmentFromSupabase } = await import('./historyService');
      const result = await deleteAssessmentFromSupabase('test-id');
      expect(typeof result).toBe('boolean');
    });
  });
});
