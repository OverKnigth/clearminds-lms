import axios, { type AxiosInstance, type AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Only redirect if we're not already on the login page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',

  // User profile
  GET_PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',

  // Courses (student)
  GET_COURSES: '/courses',
  GET_COURSE: (id: string) => `/courses/${id}`,
  GET_COURSE_VIDEOS: (id: string) => `/courses/${id}/videos`,

  // Videos
  GET_VIDEO: (id: string) => `/videos/${id}`,
  UPDATE_VIDEO_PROGRESS: (id: string) => `/videos/${id}/progress`,

  // Challenges
  SUBMIT_CHALLENGE: '/challenges/submit',
  GET_CHALLENGE_SUBMISSIONS: (videoId: string) => `/challenges/submissions/${videoId}`,

  // Tutoring
  GET_TUTORINGS: '/tutorings',
  CREATE_TUTORING: '/tutorings',
  UPDATE_TUTORING: (id: string) => `/tutorings/${id}`,
  CONFIRM_TUTORING: (id: string) => `/tutorings/${id}/confirm`,
  COMPLETE_TUTORING: (id: string) => `/tutorings/${id}/complete`,

  // Badges
  GET_BADGES: '/badges',
  GET_USER_BADGES: '/badges/user',

  // Notifications
  GET_NOTIFICATIONS: '/notifications',
  MARK_NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/mark-all-read',

  // Reports
  GET_DAILY_REPORT: '/reports/daily',
  GET_STUDENT_REPORTS: '/reports/students',
  GET_ADMIN_STATS: '/reports/stats',
  GET_GROUP_REPORT: (groupId: string) => `/reports/group/${groupId}`,

  // Admin - Users
  GET_ALL_USERS: '/users',
  CREATE_USER: '/users',
  UPDATE_USER_STATUS: (id: string) => `/users/${id}/status`,
  UPLOAD_USERS_BULK: '/users/bulk',

  // Admin - Groups
  GET_GROUPS: '/users/groups',
  CREATE_GROUP: '/users/groups',
  ENROLL_STUDENTS: (groupId: string) => `/users/groups/${groupId}/enroll`,

  // Admin - Courses
  GET_ADMIN_COURSES: '/admin/courses',
  CREATE_COURSE: '/admin/courses',
  UPDATE_COURSE: (id: string) => `/admin/courses/${id}`,
  GET_COURSE_DETAIL: (id: string) => `/admin/courses/${id}`,
  DELETE_COURSE: (id: string) => `/admin/courses/${id}`,
  UPLOAD_COURSE_IMAGE: '/admin/courses/upload-image',

  // Topics & Contents
  GET_COURSE_TOPICS: (courseId: string) => `/courses/${courseId}/topics`,
  CREATE_TOPIC: (courseId: string) => `/courses/${courseId}/topics`,
  UPDATE_TOPIC: (id: string) => `/topics/${id}`,
  DELETE_TOPIC: (id: string) => `/topics/${id}`,
  GET_TOPIC_CONTENTS: (topicId: string) => `/topics/${topicId}/contents`,
  CREATE_CONTENT: (topicId: string) => `/topics/${topicId}/contents`,
  UPDATE_CONTENT: (id: string) => `/contents/${id}`,
  DELETE_CONTENT: (id: string) => `/contents/${id}`,

  // Progress
  UPDATE_PROGRESS: (contentId: string) => `/progress/content/${contentId}`,
  GET_COURSE_PROGRESS: (courseId: string) => `/progress/course/${courseId}`,
  GET_BLOCK_PROGRESS: (blockId: string) => `/progress/block/${blockId}`,
  GET_MY_PROGRESS: '/progress/me',

  // Challenges
  SUBMIT_CHALLENGE: (contentId: string) => `/challenges/content/${contentId}/submit`,
  GET_MY_SUBMISSIONS: '/challenges/me',
  GET_SUBMISSIONS_BY_CONTENT: (contentId: string) => `/challenges/content/${contentId}`,
  REVIEW_SUBMISSION: (submissionId: string) => `/challenges/submissions/${submissionId}/review`,
};

// API Service
export const api = {
  // ─── Auth ───────────────────────────────────────────────────────────────────
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, { email, password });
      const { success, data } = response.data;
      console.log('Login response data:', data); // Debug
      if (success && data?.accessToken) {
        localStorage.setItem('authToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Fix: data.user.role is the correct field
        const userRole = data.user.role || 'student';
        console.log('User role:', userRole); // Debug
        localStorage.setItem('userRole', userRole);
        const userName = data.user.names && data.user.lastNames
          ? `${data.user.names} ${data.user.lastNames}`
          : (data.user.names || data.user.email.split('@')[0]);
        localStorage.setItem('userName', userName);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await apiClient.post(API_ENDPOINTS.LOGOUT);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
    }
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await apiClient.post(API_ENDPOINTS.RESET_PASSWORD, { token, newPassword });
    return response.data;
  },

  // ─── User Profile ────────────────────────────────────────────────────────────
  getProfile: async () => {
    const response = await apiClient.get(API_ENDPOINTS.GET_PROFILE);
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.UPDATE_PROFILE, data);
    return response.data;
  },

  // ─── Courses (student) ───────────────────────────────────────────────────────
  getCourses: async () => {
    const response = await apiClient.get(API_ENDPOINTS.GET_COURSES);
    return response.data;
  },

  getCourse: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.GET_COURSE(id));
    return response.data;
  },

  getCourseVideos: async (courseId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.GET_COURSE_VIDEOS(courseId));
    return response.data;
  },

  // ─── Videos ─────────────────────────────────────────────────────────────────
  getVideo: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.GET_VIDEO(id));
    return response.data;
  },

  updateVideoProgress: async (videoId: string, progress: number, completed: boolean) => {
    const response = await apiClient.post(API_ENDPOINTS.UPDATE_VIDEO_PROGRESS(videoId), { progress, completed });
    return response.data;
  },

  // ─── Challenges ─────────────────────────────────────────────────────────────
  submitChallenge: async (data: { videoId: string; githubUrl: string; notes?: string }) => {
    const response = await apiClient.post(API_ENDPOINTS.SUBMIT_CHALLENGE, data);
    return response.data;
  },

  getChallengeSubmissions: async (videoId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.GET_CHALLENGE_SUBMISSIONS(videoId));
    return response.data;
  },

  // ─── Tutoring ────────────────────────────────────────────────────────────────
  getTutorings: async () => {
    const response = await apiClient.get(API_ENDPOINTS.GET_TUTORINGS);
    return response.data;
  },

  createTutoring: async (data: { date: string; time: string; notes: string; topic: string }) => {
    const response = await apiClient.post(API_ENDPOINTS.CREATE_TUTORING, data);
    return response.data;
  },

  confirmTutoring: async (id: string) => {
    const response = await apiClient.post(API_ENDPOINTS.CONFIRM_TUTORING(id));
    return response.data;
  },

  completeTutoring: async (id: string, feedback?: string) => {
    const response = await apiClient.post(API_ENDPOINTS.COMPLETE_TUTORING(id), { feedback });
    return response.data;
  },

  // ─── Badges ─────────────────────────────────────────────────────────────────
  getBadges: async () => {
    const response = await apiClient.get(API_ENDPOINTS.GET_BADGES);
    return response.data;
  },

  getUserBadges: async () => {
    const response = await apiClient.get(API_ENDPOINTS.GET_USER_BADGES);
    return response.data;
  },

  // ─── Notifications ───────────────────────────────────────────────────────────
  getNotifications: async () => {
    const response = await apiClient.get(API_ENDPOINTS.GET_NOTIFICATIONS);
    return response.data;
  },

  markNotificationRead: async (id: string) => {
    const response = await apiClient.post(API_ENDPOINTS.MARK_NOTIFICATION_READ(id));
    return response.data;
  },

  markAllNotificationsRead: async () => {
    const response = await apiClient.post(API_ENDPOINTS.MARK_ALL_READ);
    return response.data;
  },

  // ─── Reports ─────────────────────────────────────────────────────────────────
  getDailyReport: async (date: string) => {
    const response = await apiClient.get(API_ENDPOINTS.GET_DAILY_REPORT, { params: { date } });
    return response.data;
  },

  getStudentReports: async () => {
    const response = await apiClient.get(API_ENDPOINTS.GET_STUDENT_REPORTS);
    return response.data;
  },

  getAdminStats: async () => {
    const response = await apiClient.get(API_ENDPOINTS.GET_ADMIN_STATS);
    return response.data;
  },

  getGroupReport: async (groupId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.GET_GROUP_REPORT(groupId));
    return response.data;
  },

  // ─── Admin - Users ───────────────────────────────────────────────────────────
  // role?: 'student' | 'tutor' | 'admin'
  getAllUsers: async (role?: string, page: number = 1, limit: number = 10) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const response = await apiClient.get(`${API_ENDPOINTS.GET_ALL_USERS}?${params.toString()}`);
    return response.data;
  },

  createUser: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.CREATE_USER, data);
    return response.data;
  },

  updateUserStatus: async (userId: string, status: 'active' | 'inactive') => {
    const response = await apiClient.patch(API_ENDPOINTS.UPDATE_USER_STATUS(userId), { status });
    return response.data;
  },

  assignCoursesToUser: async (userId: string, courseIds: string[]) => {
    const response = await apiClient.post(`/users/${userId}/assign-courses`, { courseIds });
    return response.data;
  },

  uploadUsersBulk: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Uses a different instance or overrides header for multipart/form-data
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.UPLOAD_USERS_BULK}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    return response.data;
  },

  // ─── Admin - Groups ──────────────────────────────────────────────────────────
  getAllGroups: async () => {
    const response = await apiClient.get(API_ENDPOINTS.GET_GROUPS);
    return response.data;
  },

  createGroup: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.CREATE_GROUP, data);
    return response.data;
  },

  enrollStudents: async (groupId: string, data: { userIds: string[]; courseId: string }) => {
    const response = await apiClient.post(API_ENDPOINTS.ENROLL_STUDENTS(groupId), data);
    return response.data;
  },

  // ─── Admin - Courses ─────────────────────────────────────────────────────────
  getAdminCourses: async () => {
    const response = await apiClient.get(API_ENDPOINTS.GET_ADMIN_COURSES);
    return response.data;
  },

  getCourseDetail: async (id: string) => {
    const response = await apiClient.get(API_ENDPOINTS.GET_COURSE_DETAIL(id));
    return response.data;
  },

  createCourse: async (data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.CREATE_COURSE, data);
    return response.data;
  },

  updateCourse: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.UPDATE_COURSE(id), data);
    return response.data;
  },

  deleteCourse: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.DELETE_COURSE(id));
    return response.data;
  },

  uploadCourseImage: async (file: File, courseName?: string) => {
    const formData = new FormData();
    formData.append('image', file);
    if (courseName) {
      formData.append('courseName', courseName);
    }
    
    const token = localStorage.getItem('authToken');
    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.UPLOAD_COURSE_IMAGE}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    return response.data;
  },

  getCourseTopics: async (courseId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.GET_COURSE_TOPICS(courseId));
    return response.data;
  },

  createTopic: async (courseId: string, data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.CREATE_TOPIC(courseId), data);
    return response.data;
  },

  updateTopic: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.UPDATE_TOPIC(id), data);
    return response.data;
  },

  deleteTopic: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.DELETE_TOPIC(id));
    return response.data;
  },

  getTopicContents: async (topicId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.GET_TOPIC_CONTENTS(topicId));
    return response.data;
  },

  createContent: async (topicId: string, data: any) => {
    const response = await apiClient.post(API_ENDPOINTS.CREATE_CONTENT(topicId), data);
    return response.data;
  },

  updateContent: async (id: string, data: any) => {
    const response = await apiClient.put(API_ENDPOINTS.UPDATE_CONTENT(id), data);
    return response.data;
  },

  deleteContent: async (id: string) => {
    const response = await apiClient.delete(API_ENDPOINTS.DELETE_CONTENT(id));
    return response.data;
  },

  // ─── Progress ────────────────────────────────────────────────────────────────
  updateProgress: async (contentId: string, pctWatched: number) => {
    const response = await apiClient.post(API_ENDPOINTS.UPDATE_PROGRESS(contentId), { pctWatched });
    return response.data;
  },

  getCourseProgress: async (courseId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.GET_COURSE_PROGRESS(courseId));
    return response.data;
  },

  getMyProgress: async () => {
    const response = await apiClient.get(API_ENDPOINTS.GET_MY_PROGRESS);
    return response.data;
  },

  // ─── Challenges ──────────────────────────────────────────────────────────────
  submitChallenge: async (contentId: string, data: { gitUrl: string; comment?: string }) => {
    const response = await apiClient.post(API_ENDPOINTS.SUBMIT_CHALLENGE(contentId), data);
    return response.data;
  },

  getMySubmissions: async () => {
    const response = await apiClient.get(API_ENDPOINTS.GET_MY_SUBMISSIONS);
    return response.data;
  },

  getSubmissionsByContent: async (contentId: string) => {
    const response = await apiClient.get(API_ENDPOINTS.GET_SUBMISSIONS_BY_CONTENT(contentId));
    return response.data;
  },

  reviewSubmission: async (submissionId: string, data: { grade?: number; observations?: string }) => {
    const response = await apiClient.patch(API_ENDPOINTS.REVIEW_SUBMISSION(submissionId), data);
    return response.data;
  },

  // ─── Student ─────────────────────────────────────────────────────────────────
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

  requestTutoring: async (blockId: string) => {
    const response = await apiClient.post('/student/tutoring', { blockId });
    return response.data;
  },

  rateTutoring: async (sessionId: string, rating: number, feedback?: string) => {
    const response = await apiClient.post(`/student/tutoring/${sessionId}/rate`, { rating, feedback });
    return response.data;
  },

  getStudentNotifications: async () => {
    const response = await apiClient.get('/student/notifications');
    return response.data;
  },

  markNotificationRead: async (id: string) => {
    const response = await apiClient.patch(`/student/notifications/${id}/read`);
    return response.data;
  },

  // ─── Tutor ───────────────────────────────────────────────────────────────────
  getTutorSessions: async (status?: string) => {
    const params = status ? `?status=${status}` : '';
    const response = await apiClient.get(`/tutor/sessions${params}`);
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
};

// Export axios instance for custom requests
export { apiClient, GOOGLE_CLIENT_ID };
