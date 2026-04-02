import { api } from '@/shared/services/api';
import type { IAdminPort } from '../../domain/ports/admin.port';
import type { AdminStudent, AdminTutor, AdminCourse, AdminGroup, AdminStats, CourseFormData } from '../../domain/entities/admin.entity';

const mapUser = (u: any): any => ({
  id: u.id,
  fullName: `${u.names} ${u.lastNames}`,
  email: u.email,
  enrollmentDate: u.createdAt?.split('T')[0] || '2026-01-01',
  generation: u.generation || 'N/A',
  generationName: u.generationName || '',
  assignedCourses: u.assignedCourses || [],
  courseParallelMap: u.courseParallelMap || {},
  progress: u.progress || 0,
  status: u.status,
  role: u.role?.name || 'student',
  rating: u.rating || 0,
  reviewsCount: u.reviewsCount || 0,
});

export class AdminHttpAdapter implements IAdminPort {
  async getStudents(page = 1, limit = 10): Promise<{ data: AdminStudent[]; total: number }> {
    const res = await api.getAllUsers('student', page, limit);
    const rows = res.rows || res.data || [];
    return { data: Array.isArray(rows) ? rows.map(mapUser) : [], total: res.total || 0 };
  }

  async getTutors(page = 1, limit = 10): Promise<{ data: AdminTutor[]; total: number }> {
    const res = await api.getAllUsers('tutor', page, limit);
    const rows = res.rows || res.data || [];
    return { data: Array.isArray(rows) ? rows.map(mapUser) : [], total: res.total || 0 };
  }

  async getAdmins(page = 1, limit = 10): Promise<{ data: AdminStudent[]; total: number }> {
    const res = await api.getAllUsers('admin', page, limit);
    const rows = res.rows || res.data || [];
    return { data: Array.isArray(rows) ? rows.map(mapUser) : [], total: res.total || 0 };
  }

  async getCourses(): Promise<AdminCourse[]> {
    const res = await api.getAdminCourses();
    return res.success && Array.isArray(res.data) ? res.data : [];
  }

  async getGroups(): Promise<AdminGroup[]> {
    const res = await api.getGroups();
    return res.success && Array.isArray(res.data) ? res.data : [];
  }

  async getStats(): Promise<AdminStats> {
    const res = await api.getAdminStats();
    return res.success ? res.data : { totalCourses: 0, totalStudents: 0, totalGroups: 0, behindStudents: 0, avgGroupProgress: 0 };
  }

  async createUser(data: any): Promise<any> {
    return api.createUser(data);
  }

  async updateUser(id: string, data: any): Promise<any> {
    return api.updateUser(id, data);
  }

  async updateUserStatus(id: string, status: 'active' | 'inactive'): Promise<void> {
    await api.updateUserStatus(id, status);
  }

  async deleteUser(id: string): Promise<void> {
    await api.deleteUser(id);
  }

  async createCourse(data: CourseFormData): Promise<AdminCourse> {
    const res = await api.createCourse(data);
    return res.data;
  }

  async updateCourse(id: string, data: Partial<CourseFormData>): Promise<AdminCourse> {
    const res = await api.updateCourse(id, data);
    return res.data;
  }

  async deleteCourse(id: string): Promise<void> {
    await api.deleteCourse(id);
  }

  async assignTutorsToCourse(courseId: string, tutorIds: string[]): Promise<void> {
    await (api as any).assignTutorsToCourse(courseId, tutorIds);
  }
}
