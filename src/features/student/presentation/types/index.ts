export interface Course {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  status?: string;
  topicsCount?: number;
  progress?: { total: number; completed: number; pct: number };
  group?: { id: string; name: string; cohort?: string };
  tutors?: { id: string; names: string; lastNames: string; email: string }[];
  enrolledAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  category?: string;
}

export interface BadgeAward {
  id: string;
  badge: Badge;
  awardedAt: string;
}

export interface Tutoring {
  id: string;
  status: string;
  observations?: string;
  grade?: number;
  scheduledAt?: string;
  scheduled_at?: string;
  executed_at?: string;
  executedAt?: string;
  block?: { id: string; name: string; course?: { name: string } };
  tutor?: { names: string; lastNames: string };
}
