import { apiClient } from './httpClient';

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { success, data } = response.data;
    if (success && data?.accessToken) {
      localStorage.setItem('authToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userRole', data.user.role || 'student');
      const userName = data.user.names && data.user.lastNames
        ? `${data.user.names} ${data.user.lastNames}`
        : (data.user.names || data.user.email.split('@')[0]);
      localStorage.setItem('userName', userName);
    }
    return response.data;
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) await apiClient.post('/auth/logout');
    } catch { /* ignore */ }
    finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
    }
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await apiClient.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },
};
