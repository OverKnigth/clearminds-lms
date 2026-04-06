import { apiClient } from './httpClient';

export const studentApi = {
  getStudentCourses: async () => {
    const response = await apiClient.get('/student/courses');
    return response.data;
  },

  getStudentCourseDetail: async (courseId: string) => {
    const response = await apiClient.get(`/student/courses/${courseId}`);
    return response.data;
  },

  getStudentBadges: async () => {
    const response = await apiClient.get('/student/badges');
    return response.data;
  },

  getStudentGrades: async () => {
    const response = await apiClient.get('/student/grades');
    return response.data;
  },

  getStudentTutoring: async () => {
    const response = await apiClient.get('/student/tutoring');
    return response.data;
  },

  requestTutoring: async (blockId: string, observations?: string, scheduledDate?: string) => {
    const response = await apiClient.post('/student/tutoring', { blockId, observations, scheduledAt: scheduledDate });
    return response.data;
  },

  rateTutoring: async (sessionId: string, rating: number, feedback?: string) => {
    const response = await apiClient.post(`/student/tutoring/${sessionId}/rate`, { rating, feedback });
    return response.data;
  },

  rateTutorFromChallenge: async (submissionId: string, rating: number, feedback?: string) => {
    const response = await apiClient.post(`/challenges/submissions/${submissionId}/rate-tutor`, { rating, feedback });
    return response.data;
  },

  getStudentNotifications: async () => {
    const response = await apiClient.get('/student/notifications');
    return response.data;
  },

  markStudentNotificationRead: async (id: string) => {
    const response = await apiClient.delete(`/student/notifications/${id}`);
    return response.data;
  },

  markAllStudentNotificationsRead: async () => {
    const response = await apiClient.delete('/student/notifications');
    return response.data;
  },
};
