export const COLORS = {
  primary: {
    cyan: '#06b6d4',
    blue: '#3b82f6',
  },
  status: {
    completed: '#10b981',
    locked: '#64748b',
    inProgress: '#06b6d4',
  },
  categories: {
    STRATEGY: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
    ANALYSIS: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    LEADERSHIP: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    INNOVATION: { bg: 'bg-green-500/20', text: 'text-green-400' },
  },
};

export const ROUTES = {
  landing: '/',
  login: '/login',
  dashboard: '/dashboard',
  course: (slugOrId: string) => `/course/${slugOrId}`,
  video: (courseSlugOrId: string, videoId: string) => `/course/${courseSlugOrId}/video/${videoId}`,
  tutoring: '/meetings',
  admin: '/admin',
};
