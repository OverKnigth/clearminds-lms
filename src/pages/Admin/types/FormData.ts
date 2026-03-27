export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'student' | 'tutor' | 'admin';
  status: 'active' | 'inactive';
  generation: string;
  selectedCourses: string[];
}
