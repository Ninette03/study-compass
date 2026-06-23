import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'ADVISOR' | 'ADMIN';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  login: (payload: LoginPayload) => api.post('/auth/login', payload),
  register: (payload: RegisterPayload) => api.post('/auth/register', payload),
  me: () => api.get('/auth/me'),
};

export const questionApi = {
  createQuestion: (payload: { title: string; body: string; institutionId: string; programme?: string; tags: string[] }) =>
    api.post('/questions', payload),
  getQuestions: (params?: { institutionId?: string; title?: string; skip?: number; take?: number }) =>
    api.get('/questions', { params }),
  getQuestion: (id: string, sentimentFilter?: string) =>
    api.get(`/questions/${id}`, { params: sentimentFilter ? { sentimentFilter } : undefined }),
  createResponse: (questionId: string, payload: { body: string; programme?: string; yearAttended?: number; whatWorkedWell?: string; whatCouldBeBetter?: string; wouldRecommend?: 'yes' | 'no' | 'it_depends' }) =>
    api.post(`/questions/${questionId}/responses`, { ...payload, questionId }),
  upvoteResponse: (responseId: string) =>
    api.post(`/questions/${responseId}/upvote`),
};

export const profileApi = {
  getStudentProfile: (userId: string) =>
    api.get(`/profiles/student/${userId}`),
  getAdvisorProfile: (userId: string) =>
    api.get(`/profiles/advisor/${userId}`),
  updateStudentProfile: (payload: any) =>
    api.put('/profiles/student', payload),
  updateAdvisorProfile: (payload: any) =>
    api.put('/profiles/advisor', payload),
};

export const notificationApi = {
  getUnreadNotifications: () =>
    api.get('/notifications'),
  markAsRead: (notificationId: string) =>
    api.post(`/notifications/${notificationId}/read`),
  markAllAsRead: () =>
    api.post('/notifications/read-all'),
};

export const adminApi = {
  getStats: () =>
    api.get('/admin/stats'),
  getUsers: (params?: { skip?: number; take?: number; role?: string }) =>
    api.get('/admin/users', { params }),
  getInstitutions: (params?: { skip?: number; take?: number }) =>
    api.get('/admin/institutions', { params }),
  getTags: (params?: { skip?: number; take?: number }) =>
    api.get('/admin/tags', { params }),
};
