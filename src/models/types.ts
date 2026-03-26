export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'admin' | 'tutor';
  status: 'active' | 'inactive';
  generation?: string;
  enrollmentDate?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  progress: number;
  category: string;
  modules: Module[];
  blocks: AcademicBlock[];
  tutors?: string[];
  status: 'active' | 'inactive';
  minimumPassingGrade: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  blockId: string;
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
  type: 'video' | 'challenge' | 'document';
  challengeData?: Challenge;
  documentData?: Document;
  dueDate?: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'pdf' | 'link' | 'text';
  downloadable: boolean;
}

export interface Challenge {
  id: string;
  instructions: string;
  criteria?: string;
  requiresEvidence: boolean;
  requiresGithubLink: boolean;
  requiresTutorReview: boolean;
  dueDate?: string;
  submission?: ChallengeSubmission;
}

export interface ChallengeSubmission {
  id: string;
  submittedAt: string;
  evidenceUrls: string[];
  githubLink?: string;
  notes?: string;
  status: 'pending' | 'submitted' | 'late' | 'reviewed' | 'approved' | 'needs_correction';
  tutorMeeting?: TutorMeeting;
  grade?: number;
  feedback?: string;
  submittedOnTime: boolean;
}

export interface AcademicBlock {
  id: string;
  name: string;
  order: number;
  moduleIds: string[];
  expectedProgress: number;
  requiresTutoring: boolean;
  minimumPassingGrade: number;
  badge?: Badge;
  status: 'locked' | 'in_progress' | 'ready_for_tutoring' | 'tutoring_requested' | 'tutoring_confirmed' | 'tutoring_completed' | 'failed' | 'approved';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  blockId: string;
  status: 'locked' | 'available' | 'earned';
  earnedDate?: string;
}

export interface Tutoring {
  id: string;
  studentId: string;
  studentName: string;
  tutorId?: string;
  tutorName?: string;
  courseId: string;
  courseName: string;
  blockId: string;
  blockName: string;
  requestDate: string;
  scheduledDate?: string;
  scheduledTime?: string;
  completedDate?: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';
  meetingLink?: string;
  recordingLink?: string;
  grade?: number;
  feedback?: string;
  observations?: string;
  approved?: boolean;
  attemptNumber: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'tutoring' | 'grade' | 'deadline' | 'badge' | 'course' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface StudentProgress {
  studentId: string;
  courseId: string;
  overallProgress: number;
  videosCompleted: number;
  totalVideos: number;
  challengesSubmitted: number;
  totalChallenges: number;
  currentBlock: string;
  blocksCompleted: number;
  totalBlocks: number;
  finalGrade?: number;
  badges: Badge[];
}

export interface DailyProgressReport {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  generation: string;
  lastVideoReached: string;
  overallProgress: number;
  challengesSubmitted: number;
  tutoringStatus: string;
  currentBlock: string;
  observations?: string;
}
