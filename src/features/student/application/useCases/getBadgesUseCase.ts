import type { IStudentPort } from '../../domain/ports/student.port';
import type { BadgeAward } from '../../domain/entities/student.entity';

export async function getBadgesUseCase(port: IStudentPort): Promise<BadgeAward[]> {
  return port.getBadges();
}
