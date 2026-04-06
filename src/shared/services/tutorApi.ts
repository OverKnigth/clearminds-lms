import { apiClient } from './httpClient';

export const tutorApi = {
  getTutorSessions: async (status?: string) => {
    const params = status ? `?status=${status}` : '';
    const response = await apiClient.get(`/tutor/sessions${params}`);
    return response.data;
  },

  getTutorStats: async () => {
    const response = await apiClient.get('/tutor/stats');
    return response.data;
  },

  confirmTutoringSession: async (id: string, data: { scheduledAt: string; meetingLink?: string }) => {
    const response = await apiClient.patch(`/tutor/sessions/${id}/confirm`, data);
    return response.data;
  },

  rescheduleTutoringSession: async (id: string, data: { scheduledAt: string; meetingLink?: string }) => {
    const response = await apiClient.patch(`/tutor/sessions/${id}/reschedule`, data);
    return response.data;
  },

  cancelTutoringSession: async (id: string, data: { reason: string }) => {
    const response = await apiClient.patch(`/tutor/sessions/${id}/cancel`, data);
    return response.data;
  },

  executeTutoringSession: async (id: string, data: { grade: number; observations?: string; recordingLink?: string }) => {
    const response = await apiClient.patch(`/tutor/sessions/${id}/execute`, data);
    return response.data;
  },

  getTutorStudents: async () => {
    const response = await apiClient.get('/tutor/students');
    return response.data;
  },

  getTutorChallenges: async () => {
    const response = await apiClient.get('/tutor/challenges');
    return response.data;
  },

  getTutorNotifications: async () => {
    const response = await apiClient.get('/tutor/notifications');
    return response.data;
  },

  markTutorNotificationRead: async (id: string) => {
    const response = await apiClient.delete(`/tutor/notifications/${id}`);
    return response.data;
  },

  markAllTutorNotificationsRead: async () => {
    const response = await apiClient.delete('/tutor/notifications');
    return response.data;
  },

  getTutoringConfig: async () => {
    const response = await apiClient.get('/tutor/config');
    return response.data;
  },
};
