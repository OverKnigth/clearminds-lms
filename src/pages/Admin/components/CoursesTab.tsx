import type { CourseData } from '../types';

interface CoursesTabProps {
  courses: CourseData[];
  isLoading: boolean;
  openModal: (type: 'addCourse' | 'editCourse', course?: CourseData) => void;
  onToggleStatus: (course: CourseData) => void;
}

export function CoursesTab({ courses, isLoading, openModal, onToggleStatus }: CoursesTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Gestión de Cursos</h2>
          <p className="text-sm text-slate-400">Administra cursos y asigna tutores</p>
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

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          No hay cursos registrados
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-red-500/50 transition-all">
              {course.imageUrl && (
                <img 
                  src={course.imageUrl}
                  alt={course.name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{course.name}</h3>
                <button
                  onClick={() => onToggleStatus(course)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                    course.status === 'active'
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'
                  }`}
                >
                  {course.status === 'active' ? 'Activo' : 'Inactivo'}
                </button>
              </div>
              {course.description && (
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{course.description}</p>
              )}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Tutores:</span>
                  <span className="text-white font-medium">{course.tutors?.length || 0}</span>
                </div>
                {course.tutors && course.tutors.length > 0 && (
                  <div className="text-xs text-slate-400">
                    {course.tutors.map(t => `${t.names} ${t.lastNames}`).join(', ')}
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4 border-t border-slate-700">
                <button 
                  onClick={() => openModal('editCourse', course)}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
