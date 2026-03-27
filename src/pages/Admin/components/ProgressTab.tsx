import type { Student } from '../types';

interface ProgressTabProps {
  filteredStudentsForProgress: Student[];
  progressFilter: { name: string; generation: string; course: string };
  setProgressFilter: (val: { name: string; generation: string; course: string }) => void;
  stats: any;
}

export function ProgressTab({ filteredStudentsForProgress, progressFilter, setProgressFilter, stats }: ProgressTabProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-1">Seguimiento de Progreso</h2>
        <p className="text-sm text-slate-400">Monitorea el avance por generación y módulo</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={progressFilter.name}
            onChange={(e) => setProgressFilter({ ...progressFilter, name: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <select 
          value={progressFilter.generation}
          onChange={(e) => setProgressFilter({ ...progressFilter, generation: e.target.value })}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">Todas las Generaciones</option>
          <option value="Gen 2026-A">Gen 2026-A</option>
          <option value="Gen 2026-B">Gen 2026-B</option>
          <option value="Gen 2025-B">Gen 2025-B</option>
        </select>
        <select 
          value={progressFilter.course}
          onChange={(e) => setProgressFilter({ ...progressFilter, course: e.target.value })}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">Todos los Cursos</option>
          <option value="1">Desarrollo Web Full Stack</option>
          <option value="2">AWS Cloud</option>
          <option value="3">Python para Data Science</option>
        </select>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Estudiantes', value: stats?.totalStudents || 0, color: 'red' },
          { label: 'Cursos Activos', value: stats?.totalCourses || 0, color: 'green' },
          { label: 'Grupos', value: stats?.totalGroups || 0, color: 'purple' },
          { label: 'Retos Pendientes', value: '-', color: 'yellow' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold text-${stat.color}-400`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Detailed Progress Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Estudiante</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Curso</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Módulo Actual</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Progreso</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase">Última Actividad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredStudentsForProgress.map((student) => (
              <tr key={student.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 text-sm text-white">{student.fullName}</td>
                <td className="px-6 py-4 text-sm text-slate-300">Desarrollo Web Full Stack</td>
                <td className="px-6 py-4 text-sm text-slate-400">Módulo 3: React y TypeScript</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden w-32">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-red-700"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{student.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">Hace 2 horas</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
