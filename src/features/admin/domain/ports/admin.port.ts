import type {
  AdminStudent,
  AdminTutor,
  AdminCourse,
  AdminGroup,
  AdminStats,
  CourseFormData,
} from '../entities/admin.entity';

export interface IAdminPort {
  getStudents(page?: number, limit?: number): Promise<{ data: AdminStudent[]; total: number }>;
  getTutors(page?: number, limit?: number): Promise<{ data: AdminTutor[]; total: number }>;
  getAdmins(page?: number, limit?: number): Promise<{ data: AdminStudent[]; total: number }>;
  getCourses(): Promise<AdminCourse[]>;
  getGroups(): Promise<AdminGroup[]>;
  getStats(): Promise<AdminStats>;
  createUser(data: any): Promise<any>;
  updateUser(id: string, data: any): Promise<any>;
  updateUserStatus(id: string, status: 'active' | 'inactive'): Promise<void>;
  deleteUser(id: string): Promise<void>;
  createCourse(data: CourseFormData): Promise<AdminCourse>;
  updateCourse(id: string, data: Partial<CourseFormData>): Promise<AdminCourse>;
  deleteCourse(id: string): Promise<void>;
  assignTutorsToCourse(courseId: string, tutorIds: string[]): Promise<void>;
}
