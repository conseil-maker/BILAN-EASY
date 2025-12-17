/**
 * Tests du hook useDarkMode
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock matchMedia
const mockMatchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
Object.defineProperty(window, 'matchMedia', { value: mockMatchMedia });

// Mock document.documentElement.classList
const mockClassList = {
  add: vi.fn(),
  remove: vi.fn(),
  contains: vi.fn(),
};
Object.defineProperty(document.documentElement, 'classList', { value: mockClassList });

describe('useDarkMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait retourner isDarkMode et toggleDarkMode', async () => {
    const { useDarkMode } = await import('./useDarkMode');
    const { result } = renderHook(() => useDarkMode());
    
    expect(result.current).toHaveProperty('isDarkMode');
    expect(result.current).toHaveProperty('toggleDarkMode');
    expect(typeof result.current.isDarkMode).toBe('boolean');
    expect(typeof result.current.toggleDarkMode).toBe('function');
  });

  it('devrait basculer le mode sombre', async () => {
    const { useDarkMode } = await import('./useDarkMode');
    const { result } = renderHook(() => useDarkMode());
    
    const initialMode = result.current.isDarkMode;
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    expect(result.current.isDarkMode).toBe(!initialMode);
  });

  it('devrait modifier les classes du document', async () => {
    const { useDarkMode } = await import('./useDarkMode');
    const { result } = renderHook(() => useDarkMode());
    
    act(() => {
      result.current.toggleDarkMode();
    });
    
    // Vérifier qu'une des méthodes de classList a été appelée
    const classListCalled = mockClassList.add.mock.calls.length > 0 || 
                           mockClassList.remove.mock.calls.length > 0;
    expect(classListCalled).toBe(true);
  });
});
