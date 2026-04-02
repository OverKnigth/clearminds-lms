// Student routes — consumed by shared/routes/AppRoutes
export const STUDENT_ROUTES = {
  dashboard: '/dashboard',
  courses: '/courses',
  course: (slug: string) => `/course/${slug}`,
  content: (courseSlug: string, contentSlug: string) => `/course/${courseSlug}/content/${contentSlug}`,
  meetings: '/meetings',
  profile: '/profile',
};
