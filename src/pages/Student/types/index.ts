export interface Course {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  status: string;
  topicsCount: number;
  tutors: any[];
  group: any;
  progress?: { total: number; completed: number; pct: number };
}

export interface Badge {
  id: string;
  awardedAt: string;
  badge: { id: string; name: string; description: string; imageUrl?: string; course: any };
  block: any;
}

export interface Tutoring {
  id: string;
  status: string;
  scheduledAt?: string;
  block: { name: string; course: { name: string } };
  tutor?: { names: string; lastNames: string };
}
