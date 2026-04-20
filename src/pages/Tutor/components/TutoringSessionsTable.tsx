import type { TutoringSession } from '../types';
import { SessionActions } from './SessionCard';

interface TutoringSessionsTableProps {
  sessions: TutoringSession[];
  onRefresh: () => void;
  showGradeInActions?: boolean;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  requested: { label: 'Pendiente', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  confirmed: { label: 'Confirmada', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  rescheduled: { label: 'Reagendada', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  executed: { label: 'Ejecutada', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  cancelled: { label: 'Cancelada', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

export function TutoringSessionsTable({ sessions, onRefresh, showGradeInActions = false }: TutoringSessionsTableProps) {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700/50 overflow-hidden shadow-xl">
      <table className="w-full">
        <thead className="bg-slate-900/60 border-b border-slate-700/50">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Estudiante</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Curso / Bloque</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Nota mínima</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
            <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Intento</th>
            <th className="px-4 py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {showGradeInActions ? 'Nota' : 'Acciones'}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/30">
          {sessions.map((session) => {
            const cfg = STATUS_LABELS[session.status] || STATUS_LABELS.requested;
            return (
              <tr key={session.id} className="hover:bg-slate-700/20 transition-colors align-top">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                      {session.student ? `${session.student.names[0]}${session.student.lastNames[0]}` : '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-white uppercase tracking-tighter truncate">
                        {session.student ? `${session.student.names} ${session.student.lastNames}` : 'Sin asignar'}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{session.student?.email || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-bold text-slate-200 truncate">{session.block.course.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{session.block.name}</p>
                </td>
                <td className="px-4 py-3 text-xs text-slate-300 font-bold">{session.block.minPassGrade}/10</td>
                <td className="px-4 py-3 text-xs text-slate-300">
                  {session.scheduledAt ? new Date(session.scheduledAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : 'Sin fecha'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-300">#{session.attemptNumber}</td>
                <td className="px-4 py-3">
                  {showGradeInActions ? (
                    <div className="flex justify-end">
                      {session.grade !== undefined && session.grade !== null ? (
                        <span className={`text-sm font-black ${session.grade >= session.block.minPassGrade ? 'text-green-400' : 'text-red-400'}`}>
                          {session.grade}/10
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <SessionActions session={session} onRefresh={onRefresh} compact />
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
