import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedCallback } from '../../../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce callback', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    // Call multiple times rapidly
    act(() => {
      result.current();
    });
    
    act(() => {
      result.current();
    });
    
    act(() => {
      result.current();
    });

    // Should not be called yet
    expect(callback).not.toHaveBeenCalled();

    // Advance time - should call once (last call)
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should be called once (debounced)
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should call callback after delay', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current();
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });
});

