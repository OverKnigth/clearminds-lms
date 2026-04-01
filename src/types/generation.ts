import type { CourseData } from '../pages/Admin/types';

// ── Domain types ──────────────────────────────────────────────────────────────

export interface Generation {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'inactive';
  courseCount: number;
  parallelCount: number;
}

export interface GenerationDetail extends Generation {
  courses: CourseInGeneration[];
  parallels: Parallel[];
}

export interface CourseInGeneration {
  offeringId: string;
  course: CourseData;
}

export interface Parallel {
  id: string;
  name: string;
  status: string;
  studentCount: number;
  cohortId: string;
  blockIds?: string[];
}

export interface ParallelDetail extends Parallel {
  students: EnrolledStudent[];
  offerings: OfferingInParallel[];
}

export interface EnrolledStudent {
  id: string;
  fullName: string;
  email: string;
  enrolledAt: string;
}

export interface OfferingInParallel {
  id: string;
  courseId: string;
  courseName: string;
}

// ── Payload types ─────────────────────────────────────────────────────────────

export interface CreateGenerationPayload {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  courseIds?: string[];
}

export interface UpdateGenerationPayload {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: 'active' | 'inactive';
}

export interface AddCoursesPayload {
  courseIds: string[];
}

export interface CreateParallelPayload {
  name: string;
  blockIds?: string[];
}

export interface EnrollStudentsPayload {
  userIds: string[];
}
