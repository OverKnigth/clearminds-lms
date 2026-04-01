export interface TutoringSession {
  id: string;
  status: 'requested' | 'confirmed' | 'rescheduled' | 'cancelled' | 'executed';
  requestedAt: string;
  scheduledAt?: string;
  executedAt?: string;
  meetingLink?: string;
  recordingLink?: string;
  grade?: number;
  observations?: string;
  attemptNumber: number;
  cancellationReason?: string;
  block: { id: string; name: string; minPassGrade: number; course: { id: string; name: string } };
  student: { id: string; names: string; lastNames: string; email: string } | null;
}

export interface TutorStudent {
  id: string;
  names: string;
  lastNames: string;
  email: string;
  status: string;
  course: { id: string; name: string };
  group: { id: string; name: string; cohort: string };
  progress: { total: number; completed: number; pct: number };
}

export interface ChallengeSubmission {
  id: string;
  gitUrl: string;
  comment: string | null;
  submittedAt: string;
  isLate: boolean;
  status: string;
  grade: number | null;
  observations: string | null;
  student: { id: string; names: string; lastNames: string; email: string };
  content: { id: string; title: string; course?: { id: string; name: string } };
  group?: { id: string; name: string; cohort?: string } | null;
}

export type TutorTab = 'dashboard' | 'pending' | 'upcoming' | 'completed' | 'students' | 'challenges';
