import type { IStudentPort } from '../../domain/ports/student.port';
import type { StudentMeeting } from '../../domain/entities/student.entity';

export async function getMeetingsUseCase(port: IStudentPort): Promise<StudentMeeting[]> {
  return port.getMeetings();
}
