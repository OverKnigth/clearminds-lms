import type { IStudentPort } from '../../domain/ports/student.port';
import type { StudentProgress } from '../../domain/entities/student.entity';

export async function getProgressUseCase(
  port: IStudentPort,
  courseId: string
): Promise<StudentProgress> {
  return port.getCourseProgress(courseId);
}
