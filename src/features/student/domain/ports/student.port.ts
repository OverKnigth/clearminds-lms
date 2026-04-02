import type { StudentCourse, BadgeAward, StudentMeeting, StudentProgress } from '../entities/student.entity';

export interface IStudentPort {
  getCourses(): Promise<StudentCourse[]>;
  getCourseProgress(courseId: string): Promise<StudentProgress>;
  getBadges(): Promise<BadgeAward[]>;
  getMeetings(): Promise<StudentMeeting[]>;
  requestTutoring(blockId: string, observations?: string): Promise<void>;
  rateTutoring(sessionId: string, rating: number, feedback?: string): Promise<void>;
}
