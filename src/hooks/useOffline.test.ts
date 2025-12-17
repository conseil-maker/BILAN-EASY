/**
 * Tests du hook useOffline
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

describe('useOffline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('module import', () => {
    it('devrait pouvoir importer le module', async () => {
      const module = await import('./useOffline');
      expect(module).toBeDefined();
      expect(module.useOffline).toBeDefined();
    });

    it('devrait exporter useOffline comme fonction', async () => {
      const { useOffline } = await import('./useOffline');
      expect(typeof useOffline).toBe('function');
    });
  });

  describe('hook initialization', () => {
    it('devrait retourner les propriétés attendues', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      expect(result.current).toHaveProperty('isOnline');
      expect(result.current).toHaveProperty('isServiceWorkerReady');
      expect(result.current).toHaveProperty('pendingSyncCount');
      expect(result.current).toHaveProperty('saveOffline');
      expect(result.current).toHaveProperty('getOffline');
      expect(result.current).toHaveProperty('getAllPending');
      expect(result.current).toHaveProperty('clearPending');
      expect(result.current).toHaveProperty('syncNow');
    });
  });

  describe('isOnline', () => {
    it('devrait avoir isOnline comme booléen', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      expect(typeof result.current.isOnline).toBe('boolean');
    });

    it('devrait être true ou false', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      expect([true, false]).toContain(result.current.isOnline);
    });
  });

  describe('isServiceWorkerReady', () => {
    it('devrait avoir isServiceWorkerReady comme booléen', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      expect(typeof result.current.isServiceWorkerReady).toBe('boolean');
    });
  });

  describe('pendingSyncCount', () => {
    it('devrait avoir pendingSyncCount comme nombre', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      expect(typeof result.current.pendingSyncCount).toBe('number');
    });

    it('devrait être >= 0', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      expect(result.current.pendingSyncCount).toBeGreaterThanOrEqual(0);
    });

    it('devrait être un entier', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      expect(Number.isInteger(result.current.pendingSyncCount)).toBe(true);
    });
  });

  describe('saveOffline', () => {
    it('devrait avoir saveOffline comme fonction', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      expect(typeof result.current.saveOffline).toBe('function');
    });

    it('devrait accepter des paramètres', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      // Ne devrait pas lancer d'erreur
      expect(() => result.current.saveOffline('test-key', { data: 'test' })).not.toThrow();
    });
  });

  describe('getOffline', () => {
    it('devrait avoir getOffline comme fonction', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      expect(typeof result.current.getOffline).toBe('function');
    });

    it('devrait retourner null pour une clé inexistante', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      const data = result.current.getOffline('non-existent-key');
      expect(data).toBeNull();
    });
  });

  describe('getAllPending', () => {
    it('devrait avoir getAllPending comme fonction', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      expect(typeof result.current.getAllPending).toBe('function');
    });

    it('devrait retourner un tableau', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      expect(Array.isArray(result.current.getAllPending())).toBe(true);
    });

    it('devrait retourner un tableau vide par défaut', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      expect(result.current.getAllPending()).toHaveLength(0);
    });
  });

  describe('clearPending', () => {
    it('devrait avoir clearPending comme fonction', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      expect(typeof result.current.clearPending).toBe('function');
    });

    it('devrait s\'exécuter sans erreur', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      expect(() => result.current.clearPending()).not.toThrow();
    });
  });

  describe('syncNow', () => {
    it('devrait avoir syncNow comme fonction', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      expect(typeof result.current.syncNow).toBe('function');
    });

    it('devrait être une fonction async', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      const syncResult = result.current.syncNow();
      expect(syncResult).toBeInstanceOf(Promise);
    });

    it('devrait retourner un booléen', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      const syncResult = await result.current.syncNow();
      expect(typeof syncResult).toBe('boolean');
    });
  });

  describe('cleanup', () => {
    it('devrait nettoyer les listeners au démontage', async () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { useOffline } = await import('./useOffline');
      const { unmount } = renderHook(() => useOffline());
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });

  describe('integration', () => {
    it('devrait pouvoir appeler saveOffline et getOffline', async () => {
      const { useOffline } = await import('./useOffline');
      const { result } = renderHook(() => useOffline());
      
      const testData = { test: 'value', number: 42 };
      
      // Ne devrait pas lancer d'erreur
      expect(() => result.current.saveOffline('test-integration', testData)).not.toThrow();
      expect(() => result.current.getOffline('test-integration')).not.toThrow();
    });
  });
});
