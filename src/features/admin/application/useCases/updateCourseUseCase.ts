import type { IAdminPort } from '../../domain/ports/admin.port';
import type { AdminCourse, CourseFormData } from '../../domain/entities/admin.entity';

export async function updateCourseUseCase(
  port: IAdminPort,
  id: string,
  data: Partial<CourseFormData>
): Promise<AdminCourse> {
  return port.updateCourse(id, data);
}
