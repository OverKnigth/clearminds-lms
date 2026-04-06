import { useStudentData } from '../hooks/useStudentData';
import { StudentCourses } from '../components';

export default function StudentCoursesPage() {
  const { courses, isLoading } = useStudentData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-6 pb-8">
      <div className="mb-8 bg-slate-800 border border-slate-700/50 rounded-lg px-6 py-4">
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Mis Cursos</h1>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Todos tus cursos asignados en un solo lugar</p>
      </div>
      <StudentCourses courses={courses} />
    </div>
  );
}
