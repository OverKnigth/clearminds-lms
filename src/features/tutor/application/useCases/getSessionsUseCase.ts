import type { ITutorPort } from '../../domain/ports/tutor.port';
import type { TutoringSession } from '../../domain/entities/tutor.entity';

export async function getSessionsUseCase(port: ITutorPort, status?: string): Promise<TutoringSession[]> {
  return port.getSessions(status);
}
