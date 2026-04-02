import type { TutorStudent } from '../../domain/entities';

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
    <div className="bg-slate-800 border border-slate-700/50 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-slate-700/50">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre</p>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Curso</p>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Paralelo</p>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Generación</p>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Progreso</p>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-700/30">
        {students.map(s => (
          <div key={`${s.id}-${s.course.id}`} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr] gap-4 px-5 py-3 items-center hover:bg-slate-700/20 transition-colors">
            {/* Nombre */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white text-[9px] font-black shrink-0">
                {s.names[0]}{s.lastNames[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-white uppercase tracking-tighter truncate">{s.names} {s.lastNames}</p>
                <p className="text-[10px] text-slate-500 truncate">{s.email}</p>
              </div>
            </div>

            {/* Curso */}
            <p className="text-xs text-slate-300 truncate">{s.course.name}</p>

            {/* Paralelo */}
            <p className="text-xs text-slate-300 truncate">{s.group.name}</p>

            {/* Generación */}
            <p className="text-xs text-slate-300 truncate">{s.group.cohort}</p>

            {/* Porcentaje */}
            <div className="text-right shrink-0">
              <p className="text-sm font-black text-white">{s.progress.pct}%</p>
              <div className="w-full h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-red-600 rounded-full" style={{ width: `${s.progress.pct}%` }} />
              </div>
              <p className="text-[9px] text-slate-500 mt-0.5">{s.progress.completed}/{s.progress.total}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
