/**
 * Tests du hook useAutoSave
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock du module supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    expect(typeof result.current.save).toBe('function');
    expect(typeof result.current.saveToLocalStorage).toBe('function');
    expect(typeof result.current.saveToSupabase).toBe('function');
  });

  it('devrait avoir une fonction saveToLocalStorage qui retourne un draft', async () => {
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

  it('devrait fonctionner avec des answers vides', async () => {
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

    // Devrait fonctionner sans erreur
    expect(result.current.save).toBeDefined();
  });
});
