// Clerk kaldırıldı - Basit session-based authentication kullanılıyor
import { useMemo } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Session ID oluştur (localStorage'da sakla)
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('bilan_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('bilan_session_id', sessionId);
  }
  return sessionId;
};

// User ID oluştur (localStorage'da sakla)
const getUserId = (): string => {
  let userId = localStorage.getItem('bilan_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('bilan_user_id', userId);
  }
  return userId;
};

// Types
export interface Assessment {
  id: string;
  clerkUserId: string;
  userName: string;
  packageId: string;
  packageName: string;
  coachingStyle: string;
  status: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  startedAt: string;
  completedAt?: string;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  userProfile?: any;
  dashboardData?: any;
  answers?: any[];
}

export interface CreateAssessmentData {
  userName: string;
  packageId: 'decouverte' | 'approfondi' | 'strategique';
  packageName: string;
  coachingStyle: 'collaborative' | 'analytic' | 'creative';
  totalQuestions: number;
  userProfile?: {
    fullName?: string;
    currentRole: string;
    keySkills: string[];
    pastExperiences: string[];
  };
}

export interface UpdateAssessmentData {
  status?: 'in_progress' | 'completed' | 'abandoned';
  currentQuestionIndex?: number;
  lastActivityAt?: string;
  completedAt?: string;
  dashboardData?: any;
}

export interface CreateAnswerData {
  questionId: string;
  questionTitle: string;
  questionDescription?: string;
  questionType: 'PARAGRAPH' | 'MULTIPLE_CHOICE';
  questionTheme?: string;
  questionChoices?: string[];
  value: string;
}

export interface CreateSummaryData {
  profileType: string;
  priorityThemes: string[];
  maturityLevel: string;
  keyStrengths: { text: string; sources: string[] }[];
  areasForDevelopment: { text: string; sources: string[] }[];
  recommendations: string[];
  actionPlan: {
    shortTerm: { id: string; text: string; completed?: boolean }[];
    mediumTerm: { id: string; text: string; completed?: boolean }[];
  };
}

// API Client class
class ApiClient {
  private async getHeaders(token: string | null): Promise<HeadersInit> {
    // Clerk kaldırıldı - Session-based authentication kullanılıyor
    const sessionId = getSessionId();
    const userId = getUserId();
    
    return {
      'Content-Type': 'application/json',
      'X-Test-User-Id': userId,
      'X-Session-Id': sessionId,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token: string | null,
    retries: number = 3,
    retryDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Timeout ekle (10 saniye)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: await this.getHeaders(token),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          // 4xx hataları retry etme (client error)
          if (response.status >= 400 && response.status < 500) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || `HTTP ${response.status}`);
          }
          
          // 5xx hataları retry et (server error)
          if (response.status >= 500) {
            const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
            throw new Error(error.error || `HTTP ${response.status}`);
          }
        }

        return response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Son deneme değilse ve retry edilebilir bir hata ise
        if (attempt < retries && this.isRetryableError(lastError)) {
          // Exponential backoff
          const delay = retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Son deneme veya retry edilemez hata
        throw lastError;
      }
    }
    
    throw lastError || new Error('Request failed after retries');
  }
  
  private isRetryableError(error: Error): boolean {
    // Network errors, timeout, 5xx errors retry edilebilir
    const retryableMessages = ['NetworkError', 'Failed to fetch', 'timeout', 'aborted'];
    const message = error.message.toLowerCase();
    return retryableMessages.some(msg => message.includes(msg.toLowerCase())) || 
           message.includes('500') || 
           message.includes('502') || 
           message.includes('503') ||
           message.includes('504');
  }

  // Assessments
  async createAssessment(data: CreateAssessmentData, token: string | null = null) {
    return this.request<Assessment>('/assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  async getAssessments(token: string | null = null, params?: { status?: string; limit?: number; offset?: number }) {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request<{ data: Assessment[]; pagination: any }>(`/assessments${query}`, {}, token);
  }

  async getAssessment(id: string, token: string | null = null) {
    return this.request<Assessment>(`/assessments/${id}`, {}, token);
  }

  async updateAssessment(id: string, data: UpdateAssessmentData, token: string | null = null) {
    return this.request<Assessment>(`/assessments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token);
  }

  async deleteAssessment(id: string, token: string | null = null) {
    return this.request<{ deleted: boolean; id: string }>(`/assessments/${id}`, {
      method: 'DELETE',
    }, token);
  }

  // Answers
  async addAnswer(assessmentId: string, data: CreateAnswerData, token: string | null = null) {
    return this.request(`/assessments/${assessmentId}/answers`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  async getAnswers(assessmentId: string, token: string | null = null) {
    return this.request<{ answers: any[]; total: number }>(`/assessments/${assessmentId}/answers`, {}, token);
  }

  // Summaries
  async createSummary(assessmentId: string, data: CreateSummaryData, token: string | null = null) {
    return this.request(`/assessments/${assessmentId}/summary`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  async getSummary(assessmentId: string, token: string | null = null) {
    return this.request(`/assessments/${assessmentId}/summary`, {}, token);
  }
}

export const apiClient = new ApiClient();

// Clerk kaldırıldı - useApi hook'u basitleştirildi
// Artık token gerekmiyor, session-based authentication kullanılıyor
// useApi hook'u - stable reference için useMemo kullanıyoruz
export const useApi = () => {
  return useMemo(() => ({
    // Assessments
    createAssessment: async (data: CreateAssessmentData) => {
      return apiClient.createAssessment(data, null);
    },

    getAssessments: async (params?: { status?: string; limit?: number; offset?: number }) => {
      return apiClient.getAssessments(null, params);
    },

    getAssessment: async (id: string) => {
      return apiClient.getAssessment(id, null);
    },

    updateAssessment: async (id: string, data: UpdateAssessmentData) => {
      return apiClient.updateAssessment(id, data, null);
    },

    deleteAssessment: async (id: string) => {
      return apiClient.deleteAssessment(id, null);
    },

    // Answers
    addAnswer: async (assessmentId: string, data: CreateAnswerData) => {
      return apiClient.addAnswer(assessmentId, data, null);
    },

    getAnswers: async (assessmentId: string) => {
      return apiClient.getAnswers(assessmentId, null);
    },

    // Summaries
    createSummary: async (assessmentId: string, data: CreateSummaryData) => {
      return apiClient.createSummary(assessmentId, data, null);
    },

    getSummary: async (assessmentId: string) => {
      return apiClient.getSummary(assessmentId, null);
    },
  }), []); // Empty deps - apiClient singleton, methods stable
};
