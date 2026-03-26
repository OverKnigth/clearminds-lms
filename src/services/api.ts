// API service placeholder
// Aquí irán las llamadas al backend cuando esté listo

export const api = {
  // Auth
  login: async (token: string) => {
    // TODO: Implement Google OAuth login
    console.log('Login with token:', token);
  },

  // Courses
  getCourses: async () => {
    // TODO: Fetch courses from backend
    return [];
  },

  // Progress
  updateProgress: async (videoId: string) => {
    // TODO: Update video completion status
    console.log('Update progress for video:', videoId);
  },

  // Tutoring
  scheduleTutoring: async (data: { date: string; time: string; notes: string }) => {
    // TODO: Schedule tutoring session
    console.log('Schedule tutoring:', data);
  },
};
