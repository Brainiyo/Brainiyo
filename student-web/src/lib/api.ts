const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('brainiyo_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('brainiyo_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('brainiyo_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) this.clearToken();
      throw new Error(data.message || data.error || 'Request failed');
    }

    return data;
  }

  // Auth
  verifyFirebaseToken(idToken: string) {
    return this.request('/auth/verify-token', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  updateMe(data: any) {
    return this.request('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Curriculum
  getSubjects() {
    return this.request('/content/subjects');
  }

  getChapters(subjectId: string) {
    return this.request(`/content/chapters/${subjectId}`);
  }

  getTopics(chapterId: string) {
    return this.request(`/content/topics/${chapterId}`);
  }

  getPerformance() {
    return this.request('/content/performance');
  }

  getWeakTopics() {
    return this.request('/content/weak-topics');
  }

  getRevisionDue() {
    return this.request('/questions/revision/due');
  }

  // Practice
  getNextQuestion(topicId: string, mode: string = 'practice') {
    return this.request(`/questions/next?topicId=${topicId}&mode=${mode}`);
  }

  submitAttempt(data: any) {
    return this.request('/questions/attempt', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics
  getStreak() {
    return this.request('/retention/streak');
  }

  getDashboard() {
    return this.request('/analytics/dashboard');
  }

  getLeaderboard() {
    return this.request('/analytics/leaderboard');
  }

  getPublicStats() {
    return this.request('/analytics/public-stats');
  }

  // Mock Tests
  getAvailableMockTests() {
    return this.request('/mock-tests/available');
  }

  startMockTest(templateId: string) {
    return this.request(`/mock-tests/start/${templateId}`, {
      method: 'POST',
    });
  }

  submitMockTestAnswers(attemptId: string, answers: any[]) {
    return this.request(`/mock-tests/submit/${attemptId}`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  // Bookmarks
  toggleBookmark(questionId: string) {
    return this.request('/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ questionId }),
    });
  }

  getBookmarks() {
    return this.request('/bookmarks');
  }
}

export const api = new ApiClient();
