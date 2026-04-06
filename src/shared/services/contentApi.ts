import { apiClient } from './httpClient';

export const contentApi = {
  // ─── Topics ─────────────────────────────────────────────────────────────────
  getCourseTopics: async (courseId: string) => {
    const response = await apiClient.get(`/courses/${courseId}/topics`);
    return response.data;
  },

  createTopic: async (courseId: string, data: any) => {
    const response = await apiClient.post(`/courses/${courseId}/topics`, data);
    return response.data;
  },

  updateTopic: async (id: string, data: any) => {
    const response = await apiClient.put(`/topics/${id}`, data);
    return response.data;
  },

  deleteTopic: async (id: string) => {
    const response = await apiClient.delete(`/topics/${id}`);
    return response.data;
  },

  // ─── Contents ───────────────────────────────────────────────────────────────
  getTopicContents: async (topicId: string) => {
    const response = await apiClient.get(`/topics/${topicId}/contents`);
    return response.data;
  },

  createContent: async (topicId: string, data: any) => {
    const response = await apiClient.post(`/topics/${topicId}/contents`, data);
    return response.data;
  },

  updateContent: async (id: string, data: any) => {
    const response = await apiClient.put(`/contents/${id}`, data);
    return response.data;
  },

  deleteContent: async (id: string) => {
    const response = await apiClient.delete(`/contents/${id}`);
    return response.data;
  },

  // ─── Blocks ─────────────────────────────────────────────────────────────────
  createBlock: async (courseId: string, data: any) => {
    const response = await apiClient.post(`/admin/courses/${courseId}/blocks`, data);
    return response.data;
  },

  updateBlock: async (blockId: string, data: any) => {
    const response = await apiClient.put(`/admin/blocks/${blockId}`, data);
    return response.data;
  },

  deleteBlock: async (blockId: string) => {
    const response = await apiClient.delete(`/admin/blocks/${blockId}`);
    return response.data;
  },

  linkTopicToBlock: async (topicId: string, blockId: string) => {
    const response = await apiClient.post(`/topics/${topicId}/blocks/${blockId}`);
    return response.data;
  },

  unlinkTopicFromBlock: async (topicId: string) => {
    const response = await apiClient.delete(`/topics/${topicId}/blocks`);
    return response.data;
  },

  // ─── Progress ───────────────────────────────────────────────────────────────
  updateProgress: async (contentId: string, pctWatched: number) => {
    const response = await apiClient.post(`/progress/content/${contentId}`, { pctWatched });
    return response.data;
  },

  getCourseProgress: async (courseId: string) => {
    const response = await apiClient.get(`/progress/course/${courseId}`);
    return response.data;
  },

  getMyProgress: async () => {
    const response = await apiClient.get('/progress/me');
    return response.data;
  },

  // ─── Challenges ─────────────────────────────────────────────────────────────
  submitChallenge: async (contentId: string, data: { gitUrl: string; comment?: string }) => {
    const response = await apiClient.post(`/challenges/content/${contentId}/submit`, data);
    return response.data;
  },

  getMySubmissions: async () => {
    const response = await apiClient.get('/challenges/me');
    return response.data;
  },

  getSubmissionsByContent: async (contentId: string) => {
    const response = await apiClient.get(`/challenges/content/${contentId}`);
    return response.data;
  },

  reviewSubmission: async (submissionId: string, data: { grade?: number; observations?: string }) => {
    const response = await apiClient.patch(`/challenges/submissions/${submissionId}/review`, data);
    return response.data;
  },
};
