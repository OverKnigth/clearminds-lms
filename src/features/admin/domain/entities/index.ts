// Re-export domain entities + presentation types needed by admin feature
export * from './admin.entity';

// Presentation-layer types (Tab, Student, CourseData, FormData, ContentFormData)
export type Tab = 'dashboard' | 'students' | 'tutors' | 'admins' | 'courses' | 'catalog' | 'progress' | 'badges';

export interface Student {
  id: string;
  fullName: string;
  email: string;
  enrollmentDate: string;
  generation: string;
  assignedCourses: string[];
  courseParallelMap?: { [courseId: string]: string };
  progress: number;
  status: 'active' | 'inactive';
  role?: string;
}

export interface CourseData {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  status: string;
  tutorIds?: string[];
  tutors?: Array<{ id: string; names: string; lastNames: string; email: string }>;
  blocks?: Array<{ id: string; name: string; order?: number }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'student' | 'tutor' | 'admin';
  status: 'active' | 'inactive';
  groupId: string;
  courseId: string;
  selectedCourses: string[];
  courseParallelMap?: { [courseId: string]: string };
  courseName?: string;
  courseCategory?: string;
  courseDescription?: string;
  courseStatus?: 'active' | 'inactive';
  courseImageUrl?: string;
  courseTutorIds?: string[];
}

export interface ContentFormData {
  type: 'video' | 'challenge' | 'module';
  title: string;
  description: string;
  duration: string;
  url: string;
  order: number;
  requiresEvidence: boolean;
  requiresGithubLink: boolean;
  requiresTutorReview: boolean;
}
