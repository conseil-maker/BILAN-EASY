import { useAuth } from '@clerk/clerk-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
  questionType: 'PARAGRAPH' | 'MULTIPLE_CHOICE';
  questionTheme?: string;
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
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token: string | null
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: await this.getHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Assessments
  async createAssessment(data: CreateAssessmentData, token: string) {
    return this.request<Assessment>('/assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  async getAssessments(token: string, params?: { status?: string; limit?: number; offset?: number }) {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request<{ data: Assessment[]; pagination: any }>(`/assessments${query}`, {}, token);
  }

  async getAssessment(id: string, token: string) {
    return this.request<Assessment>(`/assessments/${id}`, {}, token);
  }

  async updateAssessment(id: string, data: UpdateAssessmentData, token: string) {
    return this.request<Assessment>(`/assessments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token);
  }

  async deleteAssessment(id: string, token: string) {
    return this.request<{ deleted: boolean; id: string }>(`/assessments/${id}`, {
      method: 'DELETE',
    }, token);
  }

  // Answers
  async addAnswer(assessmentId: string, data: CreateAnswerData, token: string) {
    return this.request(`/assessments/${assessmentId}/answers`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  async getAnswers(assessmentId: string, token: string) {
    return this.request<{ answers: any[]; total: number }>(`/assessments/${assessmentId}/answers`, {}, token);
  }

  // Summaries
  async createSummary(assessmentId: string, data: CreateSummaryData, token: string) {
    return this.request(`/assessments/${assessmentId}/summary`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  }

  async getSummary(assessmentId: string, token: string) {
    return this.request(`/assessments/${assessmentId}/summary`, {}, token);
  }
}

export const apiClient = new ApiClient();

// React Hook pour utiliser l'API avec auth automatique
export const useApi = () => {
  const { getToken } = useAuth();

  return {
    // Assessments
    createAssessment: async (data: CreateAssessmentData) => {
      const token = await getToken();
      return apiClient.createAssessment(data, token);
    },

    getAssessments: async (params?: { status?: string; limit?: number; offset?: number }) => {
      const token = await getToken();
      return apiClient.getAssessments(token, params);
    },

    getAssessment: async (id: string) => {
      const token = await getToken();
      return apiClient.getAssessment(id, token);
    },

    updateAssessment: async (id: string, data: UpdateAssessmentData) => {
      const token = await getToken();
      return apiClient.updateAssessment(id, data, token);
    },

    deleteAssessment: async (id: string) => {
      const token = await getToken();
      return apiClient.deleteAssessment(id, token);
    },

    // Answers
    addAnswer: async (assessmentId: string, data: CreateAnswerData) => {
      const token = await getToken();
      return apiClient.addAnswer(assessmentId, data, token);
    },

    getAnswers: async (assessmentId: string) => {
      const token = await getToken();
      return apiClient.getAnswers(assessmentId, token);
    },

    // Summaries
    createSummary: async (assessmentId: string, data: CreateSummaryData) => {
      const token = await getToken();
      return apiClient.createSummary(assessmentId, data, token);
    },

    getSummary: async (assessmentId: string) => {
      const token = await getToken();
      return apiClient.getSummary(assessmentId, token);
    },
  };
};
