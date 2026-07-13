import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_API_URL;

if (!BACKEND_URL) {
  console.error(
    '[api] VITE_API_URL is not set. ' +
    'Add it to your .env file (local) or Vercel Environment Variables (production).'
  );
}

export const api = axios.create({
  baseURL: BACKEND_URL ?? '',
  headers: {
    'Content-Type': 'application/json',
  },
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
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
};

export const questionApi = {
  createQuestion: (payload: { title: string; body: string; institutionId: string; programme?: string; tags: string[] }) =>
    api.post('/questions', payload),
  getQuestions: (params?: { institutionId?: string; title?: string; userId?: string; skip?: number; take?: number }) =>
    api.get('/questions', { params }),
  getQuestion: (id: string, sentimentFilter?: string) =>
    api.get(`/questions/${id}`, { params: sentimentFilter ? { sentimentFilter } : undefined }),
  createResponse: (questionId: string, payload: { body: string; programme?: string; yearAttended?: number; whatWorkedWell?: string; whatCouldBeBetter?: string; wouldRecommend?: 'yes' | 'no' | 'it_depends' }) =>
    api.post(`/questions/${questionId}/responses`, { ...payload, questionId }),
  upvoteResponse: (questionId: string, responseId: string) =>
    api.post(`/questions/${questionId}/responses/${responseId}/upvote`),
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
  getVerificationQueue: () =>
    api.get('/profiles/verification-queue'),
  approveVerification: (advisorUserId: string) =>
    api.post(`/profiles/advisor/${advisorUserId}/approve-verification`),
  rejectVerification: (advisorUserId: string) =>
    api.post(`/profiles/advisor/${advisorUserId}/reject-verification`),
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
  createInstitution: (payload: { name: string; country: string; website?: string }) =>
    api.post('/admin/institutions', payload),
  getTags: (params?: { skip?: number; take?: number }) =>
    api.get('/admin/tags', { params }),
};

export const publicApi = {
  getInstitutions: (params?: { skip?: number; take?: number }) =>
    api.get('/institutions', { params }),
  getInstitution: (id: string) =>
    api.get(`/institutions/${id}`),
  getTags: (params?: { skip?: number; take?: number }) =>
    api.get('/tags', { params }),
};

export const moderationApi = {
  getFlags: () => api.get('/moderation/flags'),
  hideResponse: (responseId: string) => api.post(`/moderation/responses/${responseId}/hide`),
  unhideResponse: (responseId: string) => api.post(`/moderation/responses/${responseId}/unhide`),
  resolveFlag: (flagId: string) => api.post(`/moderation/flags/${flagId}/resolve`),
};

export const messageApi = {
  startConversation: (questionId: string, advisorId: string) =>
    api.post('/messages/conversations', { questionId, advisorId }),
  listConversations: () =>
    api.get('/messages/conversations'),
  getConversation: (id: string) =>
    api.get(`/messages/conversations/${id}`),
  sendMessage: (conversationId: string, body: string) =>
    api.post(`/messages/conversations/${conversationId}/messages`, { body }),
  unreadCount: () =>
    api.get('/messages/unread-count'),
};
