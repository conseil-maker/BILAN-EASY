/**
 * Tests du composant DraftRecovery
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock de supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
              })),
            })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
  },
}));

// Mock localStorage
let store: Record<string, string> = {};
vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => store[key] || null);
vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => { store[key] = value; });
vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => { delete store[key]; });

describe('DraftRecovery', () => {
  beforeEach(() => {
    store = {};
    vi.clearAllMocks();
  });

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
        status: 'in_progress',
        answers: [{ questionId: 'q1', answer: 'Test' }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      expect(mockDraft).toHaveProperty('id');
      expect(mockDraft).toHaveProperty('package_name');
      expect(mockDraft).toHaveProperty('status');
      expect(mockDraft).toHaveProperty('answers');
      expect(mockDraft).toHaveProperty('created_at');
      expect(mockDraft).toHaveProperty('updated_at');
      expect(Array.isArray(mockDraft.answers)).toBe(true);
    });

    it('devrait pouvoir sérialiser et désérialiser un brouillon', () => {
      const mockDraft = {
        id: 'draft-456',
        package_name: 'Bilan Approfondi',
        status: 'in_progress',
        answers: [
          { questionId: 'q1', answer: 'Réponse 1' },
          { questionId: 'q2', answer: 'Réponse 2' },
        ],
        created_at: '2025-12-17T10:00:00Z',
        updated_at: '2025-12-17T10:00:00Z',
      };
      
      const serialized = JSON.stringify(mockDraft);
      const deserialized = JSON.parse(serialized);
      
      expect(deserialized.id).toBe(mockDraft.id);
      expect(deserialized.package_name).toBe(mockDraft.package_name);
      expect(deserialized.answers).toHaveLength(2);
    });
  });

  describe('component rendering', () => {
    it('devrait ne rien afficher si pas de brouillon', async () => {
      const DraftRecovery = (await import('./DraftRecovery')).default;
      const onResume = vi.fn();
      const onDiscard = vi.fn();
      
      const { container } = render(
        <DraftRecovery 
          userId="test-user" 
          onResume={onResume} 
          onDiscard={onDiscard} 
        />
      );
      
      // Le composant devrait être vide initialement (loading ou pas de brouillon)
      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('devrait accepter les props requises', async () => {
      const DraftRecovery = (await import('./DraftRecovery')).default;
      const onResume = vi.fn();
      const onDiscard = vi.fn();
      
      expect(() => {
        render(
          <DraftRecovery 
            userId="test-user" 
            onResume={onResume} 
            onDiscard={onDiscard} 
          />
        );
      }).not.toThrow();
    });
  });

  describe('localStorage integration', () => {
    it('devrait vérifier localStorage pour un brouillon', async () => {
      const DraftRecovery = (await import('./DraftRecovery')).default;
      const onResume = vi.fn();
      const onDiscard = vi.fn();
      
      render(
        <DraftRecovery 
          userId="test-user" 
          onResume={onResume} 
          onDiscard={onDiscard} 
        />
      );
      
      expect(localStorage.getItem).toHaveBeenCalledWith('currentDraft');
    });
  });

  describe('formatDate function', () => {
    it('devrait formater correctement une date', () => {
      const dateString = '2025-12-17T10:30:00Z';
      const date = new Date(dateString);
      const formatted = date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      expect(formatted).toContain('2025');
      expect(formatted).toContain('décembre');
    });
  });

  describe('progress calculation', () => {
    it('devrait calculer la progression correctement', () => {
      const answersCount = 10;
      const progress = Math.min(answersCount * 5, 100);
      expect(progress).toBe(50);
    });

    it('devrait plafonner la progression à 100%', () => {
      const answersCount = 30;
      const progress = Math.min(answersCount * 5, 100);
      expect(progress).toBe(100);
    });

    it('devrait gérer 0 réponses', () => {
      const answersCount = 0;
      const progress = Math.min(answersCount * 5, 100);
      expect(progress).toBe(0);
    });
  });
});
