import { api } from '@/shared/services/api';
import type { ITutorPort } from '../../domain/ports/tutor.port';
import type { TutoringSession, TutorStudent, TutorChallengeSubmission, TutorStats } from '../../domain/entities/tutor.entity';

export class TutorHttpAdapter implements ITutorPort {
  async getSessions(status?: string): Promise<TutoringSession[]> {
    const res = await api.getTutorSessions(status);
    return res.success ? res.data : [];
  }

  async getStudents(): Promise<TutorStudent[]> {
    const res = await api.getTutorStudents();
    return res.success ? res.data : [];
  }

  async getChallenges(): Promise<TutorChallengeSubmission[]> {
    const res = await api.getTutorChallenges();
    return res.success ? res.data : [];
  }

  async getStats(): Promise<TutorStats> {
    const res = await api.getTutorStats();
    return res.success ? res.data : { rating: 0, reviewsCount: 0 };
  }

  async confirmSession(id: string, data: { scheduledAt: string; meetingLink?: string }): Promise<void> {
    await api.confirmTutoringSession(id, data);
  }

  async rescheduleSession(id: string, data: { scheduledAt: string; meetingLink?: string }): Promise<void> {
    await api.rescheduleTutoringSession(id, data);
  }

  async cancelSession(id: string, data: { reason: string }): Promise<void> {
    await api.cancelTutoringSession(id, data);
  }

  async executeSession(id: string, data: { grade: number; observations?: string; recordingLink?: string }): Promise<void> {
    await api.executeTutoringSession(id, data);
  }

  async reviewChallenge(submissionId: string, data: { grade?: number; observations?: string }): Promise<void> {
    await api.reviewSubmission(submissionId, data);
  }
}
