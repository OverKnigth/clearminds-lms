export interface AdminStudent {
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

export interface AdminTutor extends AdminStudent {
  rating?: number;
  reviewsCount?: number;
}

export interface AdminCourse {
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

export interface AdminGroup {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'inactive';
  courseCount: number;
  parallelCount: number;
}

export interface AdminStats {
  totalCourses: number;
  totalStudents: number;
  totalGroups: number;
  activeGroups?: number;
  behindStudents: number;
  avgGroupProgress: number;
  pendingTutorings?: number;
}

export interface CourseFormData {
  name: string;
  description?: string;
  imageUrl?: string;
  status: 'active' | 'inactive';
  slug?: string;
}
