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
