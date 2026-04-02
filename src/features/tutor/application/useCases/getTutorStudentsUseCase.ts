import type { ITutorPort } from '../../domain/ports/tutor.port';
import type { TutorStudent } from '../../domain/entities/tutor.entity';

export async function getTutorStudentsUseCase(port: ITutorPort): Promise<TutorStudent[]> {
  return port.getStudents();
}
