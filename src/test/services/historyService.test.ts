import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as historyService from '../../../services/historyService';
import type { HistoryItem } from '../../../types';

describe('HistoryService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should save assessment to history', () => {
    const mockHistoryItem: HistoryItem = {
      id: 'test-id',
      userName: 'Test User',
      packageName: 'Découverte',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      answers: [],
      summary: {
        profileType: 'Test Profile',
        priorityThemes: [],
        maturityLevel: 'Intermediate',
        keyStrengths: [],
        areasForDevelopment: [],
        recommendations: [],
        actionPlan: {
          shortTerm: [],
          mediumTerm: [],
        },
      },
    };

    historyService.saveAssessmentToHistory(mockHistoryItem);
    
    const history = historyService.getAssessmentHistory();
    expect(history).toHaveLength(1);
    expect(history[0].id).toBe('test-id');
  });

  it('should get assessment history', () => {
    const mockHistoryItem: HistoryItem = {
      id: 'test-id',
      userName: 'Test User',
      packageName: 'Découverte',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      answers: [],
      summary: {
        profileType: 'Test Profile',
        priorityThemes: [],
        maturityLevel: 'Intermediate',
        keyStrengths: [],
        areasForDevelopment: [],
        recommendations: [],
        actionPlan: {
          shortTerm: [],
          mediumTerm: [],
        },
      },
    };

    historyService.saveAssessmentToHistory(mockHistoryItem);
    const history = historyService.getAssessmentHistory();
    
    expect(history).toHaveLength(1);
  });

  it('should clear assessment history', () => {
    const mockHistoryItem: HistoryItem = {
      id: 'test-id',
      userName: 'Test User',
      packageName: 'Découverte',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      answers: [],
      summary: {
        profileType: 'Test Profile',
        priorityThemes: [],
        maturityLevel: 'Intermediate',
        keyStrengths: [],
        areasForDevelopment: [],
        recommendations: [],
        actionPlan: {
          shortTerm: [],
          mediumTerm: [],
        },
      },
    };

    historyService.saveAssessmentToHistory(mockHistoryItem);
    historyService.clearAssessmentHistory();
    
    const history = historyService.getAssessmentHistory();
    expect(history).toHaveLength(0);
  });
});

