import type { TutorStudent } from '../types';

interface StudentsTabProps {
  students: TutorStudent[];
}

export function StudentsTab({ students }: StudentsTabProps) {
  if (students.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-xl">
        <p className="text-slate-400">No tienes estudiantes asignados aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {students.map(s => (
        <div key={`${s.id}-${s.course.id}`} className="bg-slate-800 rounded-xl p-5 border border-slate-700 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {s.names[0]}{s.lastNames[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold">{s.names} {s.lastNames}</p>
            <p className="text-xs text-slate-400">{s.email}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.course.name} · {s.group.name} ({s.group.cohort})</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-white">{s.progress.pct}%</p>
            <p className="text-xs text-slate-400">{s.progress.completed}/{s.progress.total} contenidos</p>
            <div className="w-24 h-1.5 bg-slate-700 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-red-600 rounded-full" style={{ width: `${s.progress.pct}%` }} />
            </div>
          </div>
          <span className={`px-2 py-0.5 text-xs rounded-full shrink-0 ${s.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
            {s.status === 'active' ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      ))}
    </div>
  );
}
