import { api } from '../../../../shared/services/httpClient';
import type { IStudentPort } from '../../domain/ports/student.port';
import type { StudentCourse, BadgeAward, StudentMeeting, StudentProgress } from '../../domain/entities/student.entity';

export class StudentHttpAdapter implements IStudentPort {
  async getCourses(): Promise<StudentCourse[]> {
    const res = await api.getStudentCourses();
    return res.success ? res.data : [];
  }

  async getCourseProgress(courseId: string): Promise<StudentProgress> {
    const res = await api.getCourseProgress(courseId);
    return res.success ? res.data : { total: 0, completed: 0, pct: 0 };
  }

  async getBadges(): Promise<BadgeAward[]> {
    const res = await api.getStudentBadges();
    return res.success ? res.data : [];
  }

  async getMeetings(): Promise<StudentMeeting[]> {
    const res = await api.getStudentTutoring();
    return res.success ? res.data : [];
  }

  async requestTutoring(blockId: string, observations?: string): Promise<void> {
    await api.requestTutoring(blockId, observations);
  }

  async rateTutoring(sessionId: string, rating: number, feedback?: string): Promise<void> {
    await api.rateTutoring(sessionId, rating, feedback);
  }
}
