// Test modu için API client (Clerk olmadan)
import { apiClient, CreateAssessmentData, UpdateAssessmentData, CreateAnswerData, CreateSummaryData } from './apiClient';

// Test modu için session ID (localStorage'da sakla)
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('test-session-id');
  if (!sessionId) {
    sessionId = 'test-session-' + Date.now();
    localStorage.setItem('test-session-id', sessionId);
  }
  return sessionId;
};

// Test modu için user ID (localStorage'da sakla)
const getTestUserId = (): string => {
  let userId = localStorage.getItem('test-user-id');
  if (!userId) {
    userId = 'test-user-' + Date.now();
    localStorage.setItem('test-user-id', userId);
  }
  return userId;
};

// Test modu için API client wrapper
class TestApiClient {
  private getHeaders() {
    const sessionId = getSessionId();
    const userId = getTestUserId();
    return {
      'Content-Type': 'application/json',
      'X-Test-User-Id': userId,
      'X-Session-Id': sessionId,
    };
  }

  async createAssessment(data: CreateAssessmentData) {
    return apiClient.createAssessment(data, null as any); // Token null, backend test modunda bypass edecek
  }

  async getAssessments(params?: { status?: string; limit?: number; offset?: number }) {
    return apiClient.getAssessments(null as any, params);
  }

  async getAssessment(id: string) {
    return apiClient.getAssessment(id, null as any);
  }

  async updateAssessment(id: string, data: UpdateAssessmentData) {
    return apiClient.updateAssessment(id, data, null as any);
  }

  async deleteAssessment(id: string) {
    return apiClient.deleteAssessment(id, null as any);
  }

  async addAnswer(assessmentId: string, data: CreateAnswerData) {
    return apiClient.addAnswer(assessmentId, data, null as any);
  }

  async getAnswers(assessmentId: string) {
    return apiClient.getAnswers(assessmentId, null as any);
  }

  async createSummary(assessmentId: string, data: CreateSummaryData) {
    return apiClient.createSummary(assessmentId, data, null as any);
  }

  async getSummary(assessmentId: string) {
    return apiClient.getSummary(assessmentId, null as any);
  }
}

export const testApiClient = new TestApiClient();

// Test modu için React Hook
export const useTestApi = () => {
  return {
    createAssessment: testApiClient.createAssessment.bind(testApiClient),
    getAssessments: testApiClient.getAssessments.bind(testApiClient),
    getAssessment: testApiClient.getAssessment.bind(testApiClient),
    updateAssessment: testApiClient.updateAssessment.bind(testApiClient),
    deleteAssessment: testApiClient.deleteAssessment.bind(testApiClient),
    addAnswer: testApiClient.addAnswer.bind(testApiClient),
    getAnswers: testApiClient.getAnswers.bind(testApiClient),
    createSummary: testApiClient.createSummary.bind(testApiClient),
    getSummary: testApiClient.getSummary.bind(testApiClient),
  };
};

