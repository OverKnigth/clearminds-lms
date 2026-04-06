export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'student' | 'tutor' | 'admin';
  status: 'active' | 'inactive';
  groupId: string;
  groupName?: string;
  courseId: string;
  selectedCourses: string[];
  courseParallelMap?: { [courseId: string]: string };
  // Course fields
  courseName?: string;
  courseCategory?: string;
  courseDescription?: string;
  courseStatus?: 'active' | 'inactive';
  courseImageUrl?: string;
  courseTutorIds?: string[];
}
