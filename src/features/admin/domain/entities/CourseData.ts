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
