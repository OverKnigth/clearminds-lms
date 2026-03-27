import Footer from '../../components/Footer';
import { useStudentData } from './hooks/useStudentData';
import {
  StudentStats,
  StudentHero,
  UpcomingTutorings,
  StudentBadges,
  StudentCourses
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
      <div className="min-h-screen bg-slate-900 pt-16 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  const firstCourse = courses[0];

  return (
    <div className="min-h-screen bg-slate-900 pt-16">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UpcomingTutorings tutorings={upcomingTutorings} />
          <StudentBadges badges={badges} />
        </div>

        <StudentCourses courses={courses} />
      </div>
      <Footer />
    </div>
  );
}
