import type { Student, CourseData } from '../../../domain/entities';

interface AssignmentsTabProps {
  filteredStudentsForAssignments: Student[];
  courses: CourseData[];
  assignmentFilter: { name: string; generation: string };
  setAssignmentFilter: (val: { name: string; generation: string }) => void;
  toggleCourseForStudent: (studentId: string, courseId: string) => void;
}

export function AssignmentsTab({
  filteredStudentsForAssignments,
  courses,
  assignmentFilter,
  setAssignmentFilter,
  toggleCourseForStudent
}: AssignmentsTabProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6 bg-slate-800 border border-slate-700/50 rounded-lg px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Asignación de Cursos</h2>
          <p className="text-sm text-slate-400">Habilita o deshabilita cursos para cada estudiante</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar estudiante por nombre..."
            value={assignmentFilter.name}
            onChange={(e) => setAssignmentFilter({ ...assignmentFilter, name: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <select 
          value={assignmentFilter.generation}
          onChange={(e) => setAssignmentFilter({ ...assignmentFilter, generation: e.target.value })}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">Todas las Generaciones</option>
          <option value="Gen 2026-A">Gen 2026-A</option>
          <option value="Gen 2026-B">Gen 2026-B</option>
          <option value="Gen 2025-B">Gen 2025-B</option>
        </select>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider sticky left-0 bg-slate-700/50 z-10">Estudiante</th>
                {courses.map(course => (
                  <th key={course.id} className="px-4 py-4 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider min-w-[180px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-center">{course.name}</span>
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredStudentsForAssignments.map((student) => (
                <tr key={student.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 sticky left-0 bg-slate-800 z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white whitespace-nowrap">{student.fullName}</p>
                        <p className="text-xs text-slate-400">{student.generation}</p>
                      </div>
                    </div>
                  </td>
                  {courses.map(course => (
                    <td key={course.id} className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleCourseForStudent(student.id, course.id)}
                        className={`w-12 h-12 rounded-lg transition-all flex items-center justify-center mx-auto ${
                          student.assignedCourses.includes(course.id)
                            ? 'bg-green-500/20 border-2 border-green-500 hover:bg-green-500/30'
                            : 'bg-slate-700 border-2 border-slate-600 hover:bg-slate-600'
                        }`}
                      >
                        {student.assignedCourses.includes(course.id) ? (
                          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>
                    </td>
                  ))}
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 text-sm font-semibold bg-red-500/20 text-red-400 rounded-full">
                      {student.assignedCourses.length}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-slate-300 font-medium mb-1">Instrucciones</p>
            <p className="text-sm text-slate-400">
              Haz clic en los botones para habilitar (✓) o deshabilitar (✗) cursos para cada estudiante. 
              Los cambios se aplican inmediatamente y el estudiante verá los cursos actualizados en su dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
