import { apiClient } from './httpClient';

export const reportsApi = {
  getAdminStats: async () => {
    const response = await apiClient.get('/reports/stats');
    return response.data;
  },

  getDailyReport: async (date: string) => {
    const response = await apiClient.get('/reports/daily', { params: { date } });
    return response.data;
  },

  getDailyProgressReport: async () => {
    const response = await apiClient.get('/reports/daily-progress');
    return response.data;
  },

  getStudentReports: async () => {
    const response = await apiClient.get('/reports/students');
    return response.data;
  },

  getGroupReport: async (groupId: string) => {
    const response = await apiClient.get(`/reports/group/${groupId}`);
    return response.data;
  },

  getGroupHistoricalReport: async (groupId: string) => {
    const response = await apiClient.get(`/reports/group/${groupId}/historical`);
    return response.data;
  },

  getCourseGroupDetail: async (groupId: string) => {
    const response = await apiClient.get(`/reports/group/${groupId}/detail`);
    return response.data;
  },

  getStudentDetailReport: async (userId: string) => {
    const response = await apiClient.get(`/reports/student/${userId}`);
    return response.data;
  },

  getTutoringMetricsReport: async () => {
    const response = await apiClient.get('/reports/tutoring');
    return response.data;
  },

  searchStudentsByName: async (query: string) => {
    const response = await apiClient.get(`/reports/students/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  triggerDailyProgress: async () => {
    const response = await apiClient.post('/reports/trigger-daily');
    return response.data;
  },
};
