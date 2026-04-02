import type { ITutorPort } from '../../domain/ports/tutor.port';
import type { TutorChallengeSubmission } from '../../domain/entities/tutor.entity';

export async function getChallengesUseCase(port: ITutorPort): Promise<TutorChallengeSubmission[]> {
  return port.getChallenges();
}
