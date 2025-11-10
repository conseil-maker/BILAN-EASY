import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition';

describe('useSpeechRecognition', () => {
  beforeEach(() => {
    // Mock Speech Recognition API
    const mockRecognition = {
      lang: 'fr-FR',
      interimResults: true,
      continuous: true,
      start: vi.fn(),
      stop: vi.fn(),
    };
    
    (window as any).SpeechRecognition = vi.fn(() => mockRecognition);
    (window as any).webkitSpeechRecognition = vi.fn(() => mockRecognition);
  });

  it('should detect if speech recognition is supported', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    // Should return isSupported boolean
    expect(typeof result.current.isSupported).toBe('boolean');
  });

  it('should provide startListening and stopListening functions', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    expect(typeof result.current.startListening).toBe('function');
    expect(typeof result.current.stopListening).toBe('function');
  });

  it('should return listening state', () => {
    const { result } = renderHook(() => useSpeechRecognition());

    expect(typeof result.current.isListening).toBe('boolean');
  });
});

