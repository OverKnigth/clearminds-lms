import axios, { type AxiosError } from 'axios';
import { apiClient, API_BASE_URL } from './httpClient';
import type {
  UpdateGroupPayload,
  AddCoursesPayload,
  CreateParallelPayload,
  EnrollStudentsPayload,
  CreateGroupPayload,
} from '../types/group';

export const adminApi = {
  // ─── Users ──────────────────────────────────────────────────────────────────
  getAllUsers: async (role?: string, page = 1, limit = 10) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const response = await apiClient.get(`/users?${params.toString()}`);
    return response.data;
  },

  createUser: async (data: any) => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: any) => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  },

  updateUserStatus: async (userId: string, status: 'active' | 'inactive') => {
    const response = await apiClient.patch(`/users/${userId}/status`, { status });
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },

  resetUserPassword: async (userId: string, password: string) => {
    const response = await apiClient.patch(`/users/${userId}/reset-password`, { password });
    return response.data;
  },

  assignCoursesToUser: async (userId: string, courseIds: string[], groupId?: string) => {
    const response = await apiClient.post(`/users/${userId}/assign-courses`, { courseIds, groupId });
    return response.data;
  },

  uploadUsersBulk: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${API_BASE_URL}/users/bulk`, formData, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    });
    return response.data;
  },

  // ─── Courses ────────────────────────────────────────────────────────────────
  getAdminCourses: async () => {
    const response = await apiClient.get('/admin/courses');
    return response.data;
  },

  getCourseDetail: async (id: string) => {
    const response = await apiClient.get(`/admin/courses/${id}`);
    return response.data;
  },

  createCourse: async (data: any) => {
    const response = await apiClient.post('/admin/courses', data);
    return response.data;
  },

  updateCourse: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/courses/${id}`, data);
    return response.data;
  },

  deleteCourse: async (id: string) => {
    const response = await apiClient.delete(`/admin/courses/${id}`);
    return response.data;
  },

  assignTutorsToCourse: async (courseId: string, tutorIds: string[]) => {
    const response = await apiClient.post(`/admin/courses/${courseId}/tutors`, { tutorIds });
    return response.data;
  },

  uploadCourseImage: async (file: File, courseName?: string) => {
    const formData = new FormData();
    formData.append('image', file);
    if (courseName) formData.append('courseName', courseName);
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${API_BASE_URL}/admin/courses/upload-image`, formData, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    });
    return response.data;
  },

  // ─── Groups ─────────────────────────────────────────────────────────────────
  getGroups: async (): Promise<any> => {
    const response = await apiClient.get('/admin/groups');
    return response.data;
  },

  createGroup: async (data: CreateGroupPayload): Promise<any> => {
    try {
      const response = await apiClient.post('/admin/groups', data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message ?? 'Error al crear el grupo';
      if (status === 400 || status === 409) throw Object.assign(new Error(message), { status });
      throw error;
    }
  },

  updateGroup: async (id: string, data: UpdateGroupPayload): Promise<any> => {
    const response = await apiClient.patch(`/admin/groups/${id}`, data);
    return response.data;
  },

  getGroupDetail: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/admin/groups/${id}`);
    return response.data;
  },

  addCoursesToGroup: async (id: string, data: AddCoursesPayload): Promise<void> => {
    await apiClient.post(`/admin/groups/${id}/courses`, data);
  },

  enrollStudentsInGroup: async (id: string, data: EnrollStudentsPayload): Promise<void> => {
    await apiClient.post(`/admin/groups/${id}/enroll`, data);
  },

  deleteGroup: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/groups/${id}`);
  },

  createParallel: async (groupId: string, data: CreateParallelPayload): Promise<any> => {
    const response = await apiClient.post(`/admin/groups/${groupId}/parallels`, data);
    return response.data;
  },

  getParallelStudents: async (parallelId: string): Promise<any> => {
    const response = await apiClient.get(`/admin/parallels/${parallelId}/students`);
    return response.data;
  },

  enrollStudentsInParallel: async (parallelId: string, data: EnrollStudentsPayload): Promise<any> => {
    const response = await apiClient.post(`/admin/parallels/${parallelId}/enroll`, data);
    return response.data;
  },

  updateParallel: async (parallelId: string, name: string, blockIds?: string[]) => {
    const response = await apiClient.patch(`/admin/parallels/${parallelId}`, { name, blockIds });
    return response.data;
  },

  // ─── Cohorts ────────────────────────────────────────────────────────────────
  getAllCohorts: async () => {
    const response = await apiClient.get('/admin/cohorts');
    return response.data;
  },

  createCohort: async (data: any) => {
    const response = await apiClient.post('/admin/cohorts', data);
    return response.data;
  },

  // ─── Offerings ──────────────────────────────────────────────────────────────
  getCourseOfferings: async (courseId: string) => {
    const response = await apiClient.get(`/admin/courses/${courseId}/offerings`);
    return response.data;
  },

  createOffering: async (data: { courseId: string; groupId: string; tutorId?: string }) => {
    const response = await apiClient.post('/admin/offerings', data);
    return response.data;
  },

  enrollStudents: async (offeringId: string, data: { userIds: string[] }) => {
    const response = await apiClient.post(`/admin/offerings/${offeringId}/enroll`, data);
    return response.data;
  },

  // ─── Badges ─────────────────────────────────────────────────────────────────
  getBadges: async () => {
    const response = await apiClient.get('/badges');
    return response.data;
  },

  createBadge: async (data: any) => {
    const response = await apiClient.post('/badges', data);
    return response.data;
  },

  updateBadge: async (id: string, data: any) => {
    const response = await apiClient.put(`/badges/${id}`, data);
    return response.data;
  },

  deleteBadge: async (id: string) => {
    const response = await apiClient.delete(`/badges/${id}`);
    return response.data;
  },

  getUserBadges: async () => {
    const response = await apiClient.get('/badges/user');
    return response.data;
  },

  // ─── Tutoring rules ─────────────────────────────────────────────────────────
  getTutoringRules: async () => {
    const response = await apiClient.get('/admin/tutoring/rules');
    return response.data;
  },

  updateTutoringRulesBulk: async (rules: { id: string; tutorRequired: boolean; minPassGrade: number }[]) => {
    const response = await apiClient.patch('/admin/tutoring/rules/bulk', { rules });
    return response.data;
  },

  updateTutoringConfig: async (globalMessage: string) => {
    const response = await apiClient.patch('/admin/tutoring/config', { globalMessage });
    return response.data;
  },
};
