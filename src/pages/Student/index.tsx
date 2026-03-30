import { useStudentData } from './hooks/useStudentData';
import {
  StudentStats,
  StudentHero,
  UpcomingTutorings,
  StudentBadges
} from './components';

export default function Student() {
  const {
    userName,
    courses,
    badges,
    upcomingTutorings,
    isLoading,
    overallPct
  } = useStudentData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  const firstCourse = courses[0];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <StudentStats
        coursesCount={courses.length}
        overallPct={overallPct}
        badgesCount={badges.length}
        tutoringsCount={upcomingTutorings.length}
      />

      <StudentHero
        userName={userName}
        overallPct={overallPct}
        firstCourse={firstCourse}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingTutorings tutorings={upcomingTutorings} />
        <StudentBadges badges={badges} />
      </div>
    </div>
  );
}
