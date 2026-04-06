import { studentApi } from '../../../../shared/services/studentApi';
import { contentApi } from '../../../../shared/services/contentApi';
import type { IStudentPort } from '../../domain/ports/student.port';
import type { StudentCourse, BadgeAward, StudentMeeting, StudentProgress } from '../../domain/entities/student.entity';

export class StudentHttpAdapter implements IStudentPort {
  async getCourses(): Promise<StudentCourse[]> {
    const res = await studentApi.getStudentCourses();
    return res.success ? res.data : [];
  }

  async getCourseProgress(courseId: string): Promise<StudentProgress> {
    const res = await contentApi.getCourseProgress(courseId);
    return res.success ? res.data : { total: 0, completed: 0, pct: 0 };
  }

  async getBadges(): Promise<BadgeAward[]> {
    const res = await studentApi.getStudentBadges();
    return res.success ? res.data : [];
  }

  async getMeetings(): Promise<StudentMeeting[]> {
    const res = await studentApi.getStudentTutoring();
    return res.success ? res.data : [];
  }

  async requestTutoring(blockId: string, observations?: string): Promise<void> {
    await studentApi.requestTutoring(blockId, observations);
  }

  async rateTutoring(sessionId: string, rating: number, feedback?: string): Promise<void> {
    await studentApi.rateTutoring(sessionId, rating, feedback);
  }
}
