export interface StudentCourse {
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

export interface StudentBadge {
  id: string;
  name: string;
  description: string | null;
  imageUrl?: string;
  category?: string;
}

export interface BadgeAward {
  id: string;
  awardedAt: string;
  badge: StudentBadge;
  block?: { id: string; name: string };
  course?: { id: string; name: string };
}

export interface StudentMeeting {
  id: string;
  status: string;
  scheduledAt?: string;
  block: { name: string; course: { name: string } };
  tutor?: { names: string; lastNames: string };
}

export interface StudentProgress {
  total: number;
  completed: number;
  pct: number;
}
