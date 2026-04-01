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
