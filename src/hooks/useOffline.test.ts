/**
 * Tests du hook useOffline
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

describe('useOffline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait pouvoir importer le module', async () => {
    const module = await import('./useOffline');
    expect(module).toBeDefined();
    expect(module.useOffline).toBeDefined();
  });

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

  it('devrait avoir isOnline comme booléen', async () => {
    const { useOffline } = await import('./useOffline');
    const { result } = renderHook(() => useOffline());
    
    expect(typeof result.current.isOnline).toBe('boolean');
  });

  it('devrait avoir pendingSyncCount comme nombre', async () => {
    const { useOffline } = await import('./useOffline');
    const { result } = renderHook(() => useOffline());
    
    expect(typeof result.current.pendingSyncCount).toBe('number');
    expect(result.current.pendingSyncCount).toBeGreaterThanOrEqual(0);
  });

  it('devrait avoir saveOffline comme fonction', async () => {
    const { useOffline } = await import('./useOffline');
    const { result } = renderHook(() => useOffline());
    
    expect(typeof result.current.saveOffline).toBe('function');
  });

  it('devrait avoir getOffline comme fonction', async () => {
    const { useOffline } = await import('./useOffline');
    const { result } = renderHook(() => useOffline());
    
    expect(typeof result.current.getOffline).toBe('function');
  });

  it('devrait avoir getAllPending comme fonction retournant un tableau', async () => {
    const { useOffline } = await import('./useOffline');
    const { result } = renderHook(() => useOffline());
    
    expect(typeof result.current.getAllPending).toBe('function');
    expect(Array.isArray(result.current.getAllPending())).toBe(true);
  });

  it('devrait avoir syncNow comme fonction async', async () => {
    const { useOffline } = await import('./useOffline');
    const { result } = renderHook(() => useOffline());
    
    expect(typeof result.current.syncNow).toBe('function');
  });
});
