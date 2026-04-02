import type { IAdminPort } from '../../domain/ports/admin.port';

export async function assignTutorUseCase(
  port: IAdminPort,
  courseId: string,
  tutorIds: string[]
): Promise<void> {
  return port.assignTutorsToCourse(courseId, tutorIds);
}
