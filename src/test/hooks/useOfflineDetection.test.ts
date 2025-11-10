import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOfflineDetection } from '../../../hooks/useOfflineDetection';

describe('useOfflineDetection', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return online status initially', () => {
    const { result } = renderHook(() => useOfflineDetection());
    
    expect(result.current).toBe(true);
  });

  it('should detect offline status', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: false,
    });

    const { result } = renderHook(() => useOfflineDetection());
    
    expect(result.current).toBe(false);
  });
});

