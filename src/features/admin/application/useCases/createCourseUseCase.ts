import type { IAdminPort } from '../../domain/ports/admin.port';
import type { AdminCourse, CourseFormData } from '../../domain/entities/admin.entity';

export async function createCourseUseCase(
  port: IAdminPort,
  data: CourseFormData
): Promise<AdminCourse> {
  return port.createCourse(data);
}
