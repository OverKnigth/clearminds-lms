import type { IAdminPort } from '../../domain/ports/admin.port';

export async function deleteCourseUseCase(port: IAdminPort, id: string): Promise<void> {
  return port.deleteCourse(id);
}
