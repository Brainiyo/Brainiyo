import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../constants/config';
import { useAuthStore } from '../store/useAuthStore';

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  async (config) => {
    // Get token from Zustand store directly
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors (like 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => {
    // Return the response data transparently
    return response.data;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Handle unauthorized by clearing store state
        useAuthStore.getState().logout();
      }
      
      const message = error.response.data?.message || error.response.data?.error || 'Something went wrong';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    } else {
      return Promise.reject(error);
    }
  }
);

// Generic typed wrappers requested in SP-1
export const get = (url, params) => apiClient.get(url, { params });
export const post = (url, body) => apiClient.post(url, body);
export const put = (url, body) => apiClient.put(url, body);

// API Service Layer Methods
export const ApiService = {
  // Auth & Onboarding
  sendOtp: (phone) => apiClient.post('/auth/send-otp', { phone }),
  verifyOtp: (phone, otp, onboardingData) => apiClient.post('/auth/verify-otp', { phone, otp, ...onboardingData }),
  verifyToken: (idToken) => apiClient.post('/auth/verify-token', { idToken }),
  getMe: () => apiClient.get('/auth/me'),
  updateMe: (data) => apiClient.patch('/auth/me', data),
  
  // Content Drill-down
  getSubjects: (exam) => apiClient.get(`/content/subjects${exam ? `?exam=${exam}` : ''}`),
  getChapters: (subjectId) => apiClient.get(`/content/chapters/${subjectId}`),
  getTopics: (chapterId) => apiClient.get(`/content/topics/${chapterId}`),
  
  // Practice Core
  getNextQuestion: (topicId, mode = 'practice') => 
    apiClient.get(`/questions/next?topicId=${topicId}&mode=${mode}`),
  submitAttempt: (data) => apiClient.post('/questions/attempt', data),
  
  // Analytics
  getDashboard: () => apiClient.get('/analytics/dashboard'),
  getChapterHeatmap: () => apiClient.get('/analytics/chapter-heatmap'),
  getHistory: (params) => apiClient.get('/analytics/history', { params }),
  
  // Mock Tests
  generateMockTest: (examType) => apiClient.post('/mock-tests/generate', { examType }),
  submitMockTest: (testId, answers) => apiClient.post(`/mock-tests/${testId}/submit`, { answers }),
  getMockTestHistory: () => apiClient.get('/mock-tests/history'),
  getMockTestResult: (testId) => apiClient.get(`/mock-tests/${testId}/result`),
  
  // Subscriptions
  createOrder: (planKey) => apiClient.post('/subscriptions/create-order', { planKey }),
  verifyPayment: (data) => apiClient.post('/subscriptions/verify-payment', data),
  getSubscriptionStatus: () => apiClient.get('/subscriptions/status'),

  // Notifications
  savePushToken: (token) => apiClient.post('/users/push-token', { token }),
  getNotifications: () => apiClient.get('/notifications'),
  markNotificationRead: (id) => apiClient.post(`/notifications/${id}/read`),
  markAllNotificationsRead: () => apiClient.post('/notifications/read-all'),
};

export default apiClient;
