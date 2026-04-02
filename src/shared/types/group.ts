// CourseData is inlined here to avoid circular dependency with features/admin
export interface CourseData {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  status: string;
  tutorIds?: string[];
  tutors?: Array<{
    id: string;
    names: string;
    lastNames: string;
    email: string;
  }>;
  blocks?: Array<{
    id: string;
    name: string;
    order?: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

// ── Domain types ──────────────────────────────────────────────────────────────

export interface Group {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'inactive';
  courseCount: number;
  parallelCount: number;
}

export interface GroupDetail extends Group {
  courses: CourseInGroup[];
  parallels: Parallel[];
}

export interface CourseInGroup {
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

export interface CreateGroupPayload {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  courseIds?: string[];
}

export interface UpdateGroupPayload {
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
