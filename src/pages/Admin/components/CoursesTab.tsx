import type { CourseData } from '../types';

interface CoursesTabProps {
  courses: CourseData[];
  openModal: (type: 'addCourse' | 'editCourse' | 'editCourseContent', student?: any, course?: CourseData) => void;
}

export function CoursesTab({ courses, openModal }: CoursesTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Gestión de Cursos</h2>
          <p className="text-sm text-slate-400">Administra contenido, módulos y videos</p>
        </div>
        <button
          onClick={() => openModal('addCourse')}
          className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear Curso
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-red-500/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <span className="px-3 py-1 text-xs font-semibold bg-red-500/20 text-red-400 rounded-full">
                {course.category}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-4">{course.title}</h3>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Módulos:</span>
                <span className="text-white font-medium">{course.modules}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Videos:</span>
                <span className="text-white font-medium">{course.videos}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Estudiantes:</span>
                <span className="text-white font-medium">{course.students}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-slate-700">
              <button 
                onClick={() => openModal('editCourse', undefined, course)}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Editar Info
              </button>
              <button 
                onClick={() => openModal('editCourseContent', undefined, course)}
                className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
              >
                Contenido
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
