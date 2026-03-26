export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'admin';
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  progress: number;
  category: string;
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  order: number;
  videos: Video[];
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: string;
  order: number;
  completed: boolean;
  locked: boolean;
  pdfUrl?: string;
  type: 'video' | 'challenge'; // Nuevo: tipo de contenido
  challengeData?: Challenge; // Nuevo: datos del reto si es tipo challenge
}

export interface Challenge {
  id: string;
  instructions: string;
  requiresEvidence: boolean;
  requiresGithubLink: boolean;
  requiresTutorReview: boolean;
  submission?: ChallengeSubmission;
}

export interface ChallengeSubmission {
  id: string;
  submittedAt: string;
  evidenceUrls: string[];
  githubLink?: string;
  notes?: string;
  status: 'pending' | 'scheduled' | 'reviewed' | 'approved' | 'needs_correction';
  tutorMeeting?: TutorMeeting;
  grade?: number;
  feedback?: string;
}

export interface TutorMeeting {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  meetingLink?: string;
}

export interface Tutoring {
  id: string;
  date: string;
  time: string;
  notes: string;
  tutorName: string;
  status: 'pending' | 'confirmed' | 'completed';
}
