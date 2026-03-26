import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
  
  // Users
  GET_PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  
  // Courses
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
  
  // Admin
  GET_ALL_USERS: '/admin/users',
  GET_ALL_COURSES: '/admin/courses',
  CREATE_COURSE: '/admin/courses',
  UPDATE_COURSE: (id: string) => `/admin/courses/${id}`,
  DELETE_COURSE: (id: string) => `/admin/courses/${id}`,
};

// API Service
export const api = {
  // Auth
  login: async (token: string) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, { token });
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  resetPassword: async (token: string, newPassword: string) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.RESET_PASSWORD, { token, newPassword });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // Users
  getProfile: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_PROFILE);
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  updateProfile: async (data: any) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.UPDATE_PROFILE, data);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Courses
  getCourses: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_COURSES);
      return response.data;
    } catch (error) {
      console.error('Get courses error:', error);
      throw error;
    }
  },

  getCourse: async (id: string) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_COURSE(id));
      return response.data;
    } catch (error) {
      console.error('Get course error:', error);
      throw error;
    }
  },

  getCourseVideos: async (courseId: string) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_COURSE_VIDEOS(courseId));
      return response.data;
    } catch (error) {
      console.error('Get course videos error:', error);
      throw error;
    }
  },

  // Videos
  getVideo: async (id: string) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_VIDEO(id));
      return response.data;
    } catch (error) {
      console.error('Get video error:', error);
      throw error;
    }
  },

  updateVideoProgress: async (videoId: string, progress: number, completed: boolean) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.UPDATE_VIDEO_PROGRESS(videoId), {
        progress,
        completed,
      });
      return response.data;
    } catch (error) {
      console.error('Update video progress error:', error);
      throw error;
    }
  },

  // Challenges
  submitChallenge: async (data: { videoId: string; githubUrl: string; notes?: string }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.SUBMIT_CHALLENGE, data);
      return response.data;
    } catch (error) {
      console.error('Submit challenge error:', error);
      throw error;
    }
  },

  getChallengeSubmissions: async (videoId: string) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_CHALLENGE_SUBMISSIONS(videoId));
      return response.data;
    } catch (error) {
      console.error('Get challenge submissions error:', error);
      throw error;
    }
  },

  // Tutoring
  getTutorings: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_TUTORINGS);
      return response.data;
    } catch (error) {
      console.error('Get tutorings error:', error);
      throw error;
    }
  },

  createTutoring: async (data: { date: string; time: string; notes: string; topic: string }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CREATE_TUTORING, data);
      return response.data;
    } catch (error) {
      console.error('Create tutoring error:', error);
      throw error;
    }
  },

  confirmTutoring: async (id: string) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CONFIRM_TUTORING(id));
      return response.data;
    } catch (error) {
      console.error('Confirm tutoring error:', error);
      throw error;
    }
  },

  completeTutoring: async (id: string, feedback?: string) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.COMPLETE_TUTORING(id), { feedback });
      return response.data;
    } catch (error) {
      console.error('Complete tutoring error:', error);
      throw error;
    }
  },

  // Badges
  getBadges: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_BADGES);
      return response.data;
    } catch (error) {
      console.error('Get badges error:', error);
      throw error;
    }
  },

  getUserBadges: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_USER_BADGES);
      return response.data;
    } catch (error) {
      console.error('Get user badges error:', error);
      throw error;
    }
  },

  // Notifications
  getNotifications: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_NOTIFICATIONS);
      return response.data;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  },

  markNotificationRead: async (id: string) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.MARK_NOTIFICATION_READ(id));
      return response.data;
    } catch (error) {
      console.error('Mark notification read error:', error);
      throw error;
    }
  },

  markAllNotificationsRead: async () => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.MARK_ALL_READ);
      return response.data;
    } catch (error) {
      console.error('Mark all notifications read error:', error);
      throw error;
    }
  },

  // Reports
  getDailyReport: async (date: string) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_DAILY_REPORT, {
        params: { date },
      });
      return response.data;
    } catch (error) {
      console.error('Get daily report error:', error);
      throw error;
    }
  },

  getStudentReports: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_STUDENT_REPORTS);
      return response.data;
    } catch (error) {
      console.error('Get student reports error:', error);
      throw error;
    }
  },

  // Admin
  getAllUsers: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_ALL_USERS);
      return response.data;
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  },

  getAllCourses: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GET_ALL_COURSES);
      return response.data;
    } catch (error) {
      console.error('Get all courses error:', error);
      throw error;
    }
  },

  createCourse: async (data: any) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.CREATE_COURSE, data);
      return response.data;
    } catch (error) {
      console.error('Create course error:', error);
      throw error;
    }
  },

  updateCourse: async (id: string, data: any) => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.UPDATE_COURSE(id), data);
      return response.data;
    } catch (error) {
      console.error('Update course error:', error);
      throw error;
    }
  },

  deleteCourse: async (id: string) => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.DELETE_COURSE(id));
      return response.data;
    } catch (error) {
      console.error('Delete course error:', error);
      throw error;
    }
  },
};

// Export axios instance for custom requests
export { apiClient, GOOGLE_CLIENT_ID };
