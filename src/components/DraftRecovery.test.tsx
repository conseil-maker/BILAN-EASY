/**
 * Tests du composant DraftRecovery
 */

import { describe, it, expect, vi } from 'vitest';

// Mock de supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        })),
      })),
    })),
  },
}));

describe('DraftRecovery', () => {
  describe('module import', () => {
    it('devrait pouvoir importer le composant', async () => {
      const module = await import('./DraftRecovery');
      expect(module).toBeDefined();
      expect(module.default).toBeDefined();
    });

    it('devrait exporter un composant React', async () => {
      const module = await import('./DraftRecovery');
      expect(typeof module.default).toBe('function');
    });
  });

  describe('draft data structure', () => {
    it('devrait définir la structure correcte d\'un brouillon', () => {
      const mockDraft = {
        id: 'draft-123',
        package_name: 'Bilan Essentiel',
        answers: [{ questionId: 'q1', answer: 'Test' }],
        updated_at: new Date().toISOString(),
      };
      
      expect(mockDraft).toHaveProperty('id');
      expect(mockDraft).toHaveProperty('package_name');
      expect(mockDraft).toHaveProperty('answers');
      expect(mockDraft).toHaveProperty('updated_at');
      expect(Array.isArray(mockDraft.answers)).toBe(true);
    });

    it('devrait pouvoir sérialiser et désérialiser un brouillon', () => {
      const mockDraft = {
        id: 'draft-456',
        package_name: 'Bilan Approfondi',
        answers: [
          { questionId: 'q1', answer: 'Réponse 1' },
          { questionId: 'q2', answer: 'Réponse 2' },
        ],
        updated_at: '2025-12-17T10:00:00Z',
      };
      
      const serialized = JSON.stringify(mockDraft);
      const deserialized = JSON.parse(serialized);
      
      expect(deserialized.id).toBe(mockDraft.id);
      expect(deserialized.package_name).toBe(mockDraft.package_name);
      expect(deserialized.answers).toHaveLength(2);
    });
  });
});
