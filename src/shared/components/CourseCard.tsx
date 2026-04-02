import { Link } from 'react-router-dom';
import type { Course } from '../models/types';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const isCompleted = course.progress === 100;

  return (
    <Link to={`/course/${course.slug || course.id}`} className="group">
      <div className="relative overflow-hidden rounded-xl bg-slate-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20">
        <div className="aspect-video overflow-hidden">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        </div>

        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-xs font-semibold bg-red-500/90 text-white rounded-full backdrop-blur-sm">
            {course.category}
          </span>
        </div>

        {isCompleted && (
          <div className="absolute top-3 right-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{course.title}</h3>
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Progreso</span>
              <span className="font-medium">{course.progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted
                    ? 'bg-gradient-to-r from-green-400 to-green-500'
                    : 'bg-gradient-to-r from-red-600 to-red-700'
                }`}
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
          <button className={`w-full py-2.5 rounded-lg font-medium transition-colors backdrop-blur-sm ${
            isCompleted
              ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}>
            {isCompleted ? 'Completado ✓' : 'Continuar Aprendiendo'}
          </button>
        </div>
      </div>
    </Link>
  );
}
