/**
 * Tests pour le hook useQuestionnaireState
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuestionnaireState } from './useQuestionnaireState';

describe('useQuestionnaireState', () => {
  it('devrait initialiser avec les valeurs par défaut', () => {
    const { result } = renderHook(() => useQuestionnaireState());
    const [state] = result.current;

    expect(state.messages).toEqual([]);
    expect(state.answers).toEqual([]);
    expect(state.currentQuestion).toBeNull();
    expect(state.isLoading).toBe(true);
    expect(state.showSidePanel).toBe(true);
  });

  it('devrait accepter des réponses initiales', () => {
    const initialAnswers = [
      { questionId: '1', text: 'Réponse 1', category: 'parcours', timestamp: Date.now() },
    ];
    
    const { result } = renderHook(() => useQuestionnaireState(initialAnswers));
    const [state] = result.current;

    expect(state.answers).toEqual(initialAnswers);
  });

  it('devrait toggle les settings', () => {
    const { result } = renderHook(() => useQuestionnaireState());
    
    expect(result.current[0].showSettings).toBe(false);
    
    act(() => {
      result.current[1].toggleSettings();
    });
    
    expect(result.current[0].showSettings).toBe(true);
    
    act(() => {
      result.current[1].toggleSettings();
    });
    
    expect(result.current[0].showSettings).toBe(false);
  });

  it('devrait toggle le side panel', () => {
    const { result } = renderHook(() => useQuestionnaireState());
    
    expect(result.current[0].showSidePanel).toBe(true);
    
    act(() => {
      result.current[1].toggleSidePanel();
    });
    
    expect(result.current[0].showSidePanel).toBe(false);
  });

  it('devrait accepter un module', () => {
    const { result } = renderHook(() => useQuestionnaireState());
    
    act(() => {
      result.current[1].acceptModule('module-1');
    });
    
    expect(result.current[0].activeModule).toBe('module-1');
    expect(result.current[0].moduleQuestionCount).toBe(0);
    expect(result.current[0].suggestedModule).toBeNull();
  });

  it('devrait décliner un module', () => {
    const { result } = renderHook(() => useQuestionnaireState());
    
    act(() => {
      result.current[1].declineModule('module-1');
    });
    
    expect(result.current[0].declinedModules.has('module-1')).toBe(true);
    expect(result.current[0].suggestedModule).toBeNull();
  });

  it('devrait démarrer l\'exploration de carrière', () => {
    const { result } = renderHook(() => useQuestionnaireState());
    
    act(() => {
      result.current[1].startCareerExploration();
    });
    
    expect(result.current[0].showCareerExploration).toBe(true);
    expect(result.current[0].showCareerExplorationProposal).toBe(false);
  });

  it('devrait confirmer la fin du bilan', () => {
    const { result } = renderHook(() => useQuestionnaireState());
    
    act(() => {
      result.current[1].confirmEndBilan();
    });
    
    expect(result.current[0].showEndConfirmation).toBe(false);
    expect(result.current[0].isSummarizing).toBe(true);
  });

  it('devrait demander un approfondissement', () => {
    const { result } = renderHook(() => useQuestionnaireState());
    
    act(() => {
      result.current[1].requestDeepening();
    });
    
    expect(result.current[0].showEndConfirmation).toBe(false);
    expect(result.current[0].userWantsToDeepen).toBe(true);
  });

  it('devrait réinitialiser l\'état', () => {
    const { result } = renderHook(() => useQuestionnaireState());
    
    // Modifier quelques états
    act(() => {
      result.current[1].setMessages([{ role: 'assistant', content: 'Test' }]);
      result.current[1].setIsLoading(false);
    });
    
    expect(result.current[0].messages.length).toBe(1);
    expect(result.current[0].isLoading).toBe(false);
    
    // Réinitialiser
    act(() => {
      result.current[1].resetState();
    });
    
    expect(result.current[0].messages).toEqual([]);
    expect(result.current[0].isLoading).toBe(true);
  });
});
