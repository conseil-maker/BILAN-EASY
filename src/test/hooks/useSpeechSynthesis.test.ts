import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSpeechSynthesis } from '../../../hooks/useSpeechSynthesis';

describe('useSpeechSynthesis', () => {
  beforeEach(() => {
    // Mock Speech Synthesis API
    (window as any).speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn().mockReturnValue([]),
    };
    (window as any).SpeechSynthesisUtterance = vi.fn();
  });

  it('should detect if speech synthesis is supported', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    // Should return isSupported boolean
    expect(typeof result.current.isSupported).toBe('boolean');
  });

  it('should provide speak and cancel functions', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    expect(typeof result.current.speak).toBe('function');
    expect(typeof result.current.cancel).toBe('function');
  });

  it('should return speaking state', () => {
    const { result } = renderHook(() => useSpeechSynthesis());

    expect(typeof result.current.isSpeaking).toBe('boolean');
  });
});

