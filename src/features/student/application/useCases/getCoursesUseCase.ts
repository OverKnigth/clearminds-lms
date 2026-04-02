import type { IStudentPort } from '../../domain/ports/student.port';
import type { StudentCourse } from '../../domain/entities/student.entity';

export async function getCoursesUseCase(port: IStudentPort): Promise<StudentCourse[]> {
  return port.getCourses();
}
