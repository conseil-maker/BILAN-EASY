/**
 * Tests du hook useAutoSave
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Mock du module supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

// Mock localStorage
let store: Record<string, string> = {};
vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => store[key] || null);
vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => { store[key] = value; });
vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => { delete store[key]; });

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store = {};
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('module import', () => {
    it('devrait pouvoir importer le hook', async () => {
      const module = await import('./useAutoSave');
      expect(module).toBeDefined();
      expect(module.useAutoSave).toBeDefined();
    });

    it('devrait exporter useAutoSave comme fonction', async () => {
      const { useAutoSave } = await import('./useAutoSave');
      expect(typeof useAutoSave).toBe('function');
    });
  });

  describe('hook initialization', () => {
    it('devrait retourner les fonctions de sauvegarde', async () => {
      const { useAutoSave } = await import('./useAutoSave');
      
      const { result } = renderHook(() =>
        useAutoSave({
          userId: 'test-user',
          assessmentId: 'test-assessment',
          answers: [],
          packageName: 'Test',
          enabled: true,
        })
      );

      expect(result.current.save).toBeDefined();
      expect(result.current.saveToLocalStorage).toBeDefined();
      expect(result.current.saveToSupabase).toBeDefined();
    });

    it('devrait avoir save comme fonction', async () => {
      const { useAutoSave } = await import('./useAutoSave');
      
      const { result } = renderHook(() =>
        useAutoSave({
          userId: 'test-user',
          assessmentId: 'test-assessment',
          answers: [],
          packageName: 'Test',
          enabled: true,
        })
      );

      expect(typeof result.current.save).toBe('function');
    });

    it('devrait avoir saveToLocalStorage comme fonction', async () => {
      const { useAutoSave } = await import('./useAutoSave');
      
      const { result } = renderHook(() =>
        useAutoSave({
          userId: 'test-user',
          assessmentId: 'test-assessment',
          answers: [],
          packageName: 'Test',
          enabled: true,
        })
      );

      expect(typeof result.current.saveToLocalStorage).toBe('function');
    });

    it('devrait avoir saveToSupabase comme fonction', async () => {
      const { useAutoSave } = await import('./useAutoSave');
      
      const { result } = renderHook(() =>
        useAutoSave({
          userId: 'test-user',
          assessmentId: 'test-assessment',
          answers: [],
          packageName: 'Test',
          enabled: true,
        })
      );

      expect(typeof result.current.saveToSupabase).toBe('function');
    });
  });

  describe('saveToLocalStorage', () => {
    it('devrait retourner un draft avec les bonnes propriétés', async () => {
      const { useAutoSave } = await import('./useAutoSave');
      
      const { result } = renderHook(() =>
        useAutoSave({
          userId: 'test-user',
          assessmentId: 'test-assessment',
          answers: [{ id: '1', answer: 'test' }],
          packageName: 'Essentiel',
          enabled: true,
        })
      );

      const draft = result.current.saveToLocalStorage();
      
      expect(draft).toBeDefined();
      expect(draft.id).toBe('test-assessment');
      expect(draft.package_name).toBe('Essentiel');
      expect(draft.status).toBe('in_progress');
    });

    it('devrait inclure les réponses dans le draft', async () => {
      const { useAutoSave } = await import('./useAutoSave');
      const answers = [
        { id: '1', answer: 'Réponse 1' },
        { id: '2', answer: 'Réponse 2' },
      ];
      
      const { result } = renderHook(() =>
        useAutoSave({
          userId: 'test-user',
          assessmentId: 'test-assessment',
          answers,
          packageName: 'Approfondi',
          enabled: true,
        })
      );

      const draft = result.current.saveToLocalStorage();
      
      expect(draft.answers).toEqual(answers);
    });

    it('devrait inclure updated_at dans le draft', async () => {
      const { useAutoSave } = await import('./useAutoSave');
      
      const { result } = renderHook(() =>
        useAutoSave({
          userId: 'test-user',
          assessmentId: 'test-assessment',
          answers: [],
          packageName: 'Test',
          enabled: true,
        })
      );

      const draft = result.current.saveToLocalStorage();
      
      // Le draft devrait avoir au moins updated_at
      expect(draft.updated_at).toBeDefined();
    });

    it('devrait sauvegarder dans localStorage', async () => {
      const { useAutoSave } = await import('./useAutoSave');
      
      const { result } = renderHook(() =>
        useAutoSave({
          userId: 'test-user',
          assessmentId: 'test-assessment',
          answers: [],
          packageName: 'Test',
          enabled: true,
        })
      );

      result.current.saveToLocalStorage();
      
      expect(localStorage.setItem).toHaveBeenCalledWith('currentDraft', expect.any(String));
    });
  });

  describe('enabled option', () => {
    it('devrait fonctionner avec enabled à false', async () => {
      const { useAutoSave } = await import('./useAutoSave');
      
      const { result } = renderHook(() =>
        useAutoSave({
          userId: 'test-user',
          assessmentId: 'test-assessment',
          answers: [],
          packageName: 'Test',
          enabled: false,
        })
      );

      expect(result.current.save).toBeDefined();
    });

    it('devrait fonctionner avec enabled à true', async () => {
      const { useAutoSave } = await import('./useAutoSave');
      
      const { result } = renderHook(() =>
        useAutoSave({
          userId: 'test-user',
          assessmentId: 'test-assessment',
          answers: [],
          packageName: 'Test',
          enabled: true,
        })
      );

      expect(result.current.save).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('devrait gérer un tableau de réponses vide', async () => {
      const { useAutoSave } = await import('./useAutoSave');
      
      const { result } = renderHook(() =>
        useAutoSave({
          userId: 'test-user',
          assessmentId: 'test-assessment',
          answers: [],
          packageName: 'Test',
          enabled: true,
        })
      );

      const draft = result.current.saveToLocalStorage();
      expect(draft.answers).toEqual([]);
    });

    it('devrait gérer un grand nombre de réponses', async () => {
      const { useAutoSave } = await import('./useAutoSave');
      const manyAnswers = Array.from({ length: 100 }, (_, i) => ({
        id: `q${i}`,
        answer: `Réponse ${i}`,
      }));
      
      const { result } = renderHook(() =>
        useAutoSave({
          userId: 'test-user',
          assessmentId: 'test-assessment',
          answers: manyAnswers,
          packageName: 'Stratégique',
          enabled: true,
        })
      );

      const draft = result.current.saveToLocalStorage();
      expect(draft.answers).toHaveLength(100);
    });

    it('devrait gérer des réponses avec caractères spéciaux', async () => {
      const { useAutoSave } = await import('./useAutoSave');
      const answers = [
        { id: '1', answer: 'Réponse avec "guillemets"' },
        { id: '2', answer: 'Réponse avec\nretour à la ligne' },
        { id: '3', answer: 'Réponse avec émojis 🎉' },
      ];
      
      const { result } = renderHook(() =>
        useAutoSave({
          userId: 'test-user',
          assessmentId: 'test-assessment',
          answers,
          packageName: 'Test',
          enabled: true,
        })
      );

      const draft = result.current.saveToLocalStorage();
      expect(draft.answers).toEqual(answers);
    });
  });

  describe('saveToSupabase', () => {
    it('devrait être une fonction async', async () => {
      const { useAutoSave } = await import('./useAutoSave');
      
      const { result } = renderHook(() =>
        useAutoSave({
          userId: 'test-user',
          assessmentId: 'test-assessment',
          answers: [],
          packageName: 'Test',
          enabled: true,
        })
      );

      const saveResult = result.current.saveToSupabase();
      expect(saveResult).toBeInstanceOf(Promise);
    });
  });

  describe('save', () => {
    it('devrait être une fonction async', async () => {
      const { useAutoSave } = await import('./useAutoSave');
      
      const { result } = renderHook(() =>
        useAutoSave({
          userId: 'test-user',
          assessmentId: 'test-assessment',
          answers: [],
          packageName: 'Test',
          enabled: true,
        })
      );

      const saveResult = result.current.save();
      expect(saveResult).toBeInstanceOf(Promise);
    });
  });
});
