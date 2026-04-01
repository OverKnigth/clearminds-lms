export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'student' | 'tutor' | 'admin';
  status: 'active' | 'inactive';
  generationId: string;  // cohort/generation id for cascading selection
  generation: string;    // courseId assigned to the user
  groupId: string;
  selectedCourses: string[];
  courseParallelMap?: { [courseId: string]: string };
  // Course fields
  courseName?: string;
  courseCategory?: string;
  courseDescription?: string;
  courseStatus?: 'active' | 'inactive';
  courseImageUrl?: string;
}
