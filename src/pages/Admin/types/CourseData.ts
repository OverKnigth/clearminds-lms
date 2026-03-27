export interface CourseData {
  id: string;
  name: string;
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
  createdAt?: string;
  updatedAt?: string;
}
