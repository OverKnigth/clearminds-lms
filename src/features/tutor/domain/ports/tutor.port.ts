import type { TutoringSession, TutorStudent, TutorChallengeSubmission, TutorStats } from '../entities/tutor.entity';

export interface ITutorPort {
  getSessions(status?: string): Promise<TutoringSession[]>;
  getStudents(): Promise<TutorStudent[]>;
  getChallenges(): Promise<TutorChallengeSubmission[]>;
  getStats(): Promise<TutorStats>;
  confirmSession(id: string, data: { scheduledAt: string; meetingLink?: string }): Promise<void>;
  rescheduleSession(id: string, data: { scheduledAt: string; meetingLink?: string }): Promise<void>;
  cancelSession(id: string, data: { reason: string }): Promise<void>;
  executeSession(id: string, data: { grade: number; observations?: string; recordingLink?: string }): Promise<void>;
  reviewChallenge(submissionId: string, data: { grade?: number; observations?: string }): Promise<void>;
}
