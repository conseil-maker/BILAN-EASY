import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../../services/apiClient';

// Mock fetch
global.fetch = vi.fn();

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = vi.fn(() => null);
    Storage.prototype.setItem = vi.fn();
  });

  it('should create assessment', async () => {
    const mockResponse = {
      id: 'test-id',
      clerkUserId: 'test-user',
      userName: 'Test User',
      packageId: 'decouverte',
      packageName: 'Découverte',
      coachingStyle: 'collaborative',
      status: 'in_progress',
      currentQuestionIndex: 0,
      totalQuestions: 10,
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await apiClient.createAssessment(
      {
        userName: 'Test User',
        packageId: 'decouverte',
        packageName: 'Découverte',
        coachingStyle: 'collaborative',
        totalQuestions: 10,
      },
      null
    );

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/assessments'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('should retry on 5xx errors', async () => {
    // Mock fetch to fail first time with 500, then succeed
    // Error message must contain "500" for retry mechanism to work
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'HTTP 500' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          id: 'test-id',
          clerkUserId: 'test-user',
          userName: 'Test User',
          packageId: 'decouverte',
          packageName: 'Découverte',
          coachingStyle: 'collaborative',
          status: 'in_progress',
          currentQuestionIndex: 0,
          totalQuestions: 10,
          startedAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });

    // Use vi.useFakeTimers to speed up retry delays
    vi.useFakeTimers();
    
    const promise = apiClient.createAssessment(
      {
        userName: 'Test User',
        packageId: 'decouverte',
        packageName: 'Découverte',
        coachingStyle: 'collaborative',
        totalQuestions: 10,
      },
      null
    );

    // Fast-forward timers to skip retry delays
    await vi.runAllTimersAsync();
    
    const result = await promise;

    // Should retry (fetch called twice)
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(result.id).toBe('test-id');
    
    vi.useRealTimers();
  });

  it('should get assessments with pagination', async () => {
    const mockResponse = {
      data: [
        {
          id: 'test-id-1',
          userName: 'Test User 1',
          packageId: 'decouverte',
        },
        {
          id: 'test-id-2',
          userName: 'Test User 2',
          packageId: 'approfondi',
        },
      ],
      pagination: {
        total: 2,
        limit: 10,
        offset: 0,
        hasMore: false,
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await apiClient.getAssessments(null, { limit: 10, offset: 0 });

    expect(result.data).toHaveLength(2);
    expect(result.pagination.total).toBe(2);
  });

  it('should add answer', async () => {
    const mockResponse = {
      id: 'answer-id',
      assessmentId: 'assessment-id',
      questionId: 'question-1',
      value: 'Test answer',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await apiClient.addAnswer(
      'assessment-id',
      {
        questionId: 'question-1',
        questionTitle: 'Test Question',
        questionType: 'PARAGRAPH',
        value: 'Test answer',
      },
      null
    );

    expect(result.id).toBe('answer-id');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/assessments/assessment-id/answers'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('should create summary', async () => {
    const mockResponse = {
      id: 'summary-id',
      assessmentId: 'assessment-id',
      profileType: 'Test Profile',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await apiClient.createSummary(
      'assessment-id',
      {
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
      null
    );

    expect(result.id).toBe('summary-id');
  });
});
