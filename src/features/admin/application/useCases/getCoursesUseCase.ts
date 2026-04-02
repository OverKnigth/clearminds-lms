import type { IAdminPort } from '../../domain/ports/admin.port';
import type { AdminCourse } from '../../domain/entities/admin.entity';

export async function getCoursesUseCase(port: IAdminPort): Promise<AdminCourse[]> {
  return port.getCourses();
}
