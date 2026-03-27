import { useNavigate } from 'react-router-dom';
import type { Course } from '../types';

export function StudentCourses({ courses }: { courses: Course[] }) {
  const navigate = useNavigate();

  if (courses.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-xl">
        <p className="text-slate-400 mb-2">No tienes cursos asignados aún</p>
        <p className="text-slate-500 text-sm">Contacta a tu administrador para que te asigne cursos</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-5">Mis Cursos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <button key={course.id} onClick={() => navigate(`/course/${course.slug || course.id}`)}
            className="text-left bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-red-500/50 transition-all hover:scale-105 hover:shadow-xl flex flex-col h-full">
            {course.imageUrl ? (
              <img src={course.imageUrl} alt={course.name} className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-gradient-to-br from-red-900/30 to-slate-800 flex items-center justify-center shrink-0">
                <svg className="w-12 h-12 text-red-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-semibold text-white mb-1">{course.name}</h3>
              {course.description && <p className="text-sm text-slate-400 line-clamp-2 mb-3 flex-grow">{course.description}</p>}
              <div className="mt-auto">
                 <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                   <span>Progreso</span>
                   <span className="font-medium text-white">{course.progress?.pct ?? 0}%</span>
                 </div>
                 <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-red-600 to-red-700 rounded-full transition-all"
                     style={{ width: `${course.progress?.pct ?? 0}%` }} />
                 </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
