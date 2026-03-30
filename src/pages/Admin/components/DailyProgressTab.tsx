import { useState, useEffect } from 'react';
import { api } from '../../../services/api';

interface DailyLog {
  studentName: string;
  studentId: string;
  logs: {
    date: string;
    pct: number;
    lastVideo: string;
    challengesCount: number;
  }[];
}

export function DailyProgressTab() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    loadDailyLogs();
  }, []);

  const loadDailyLogs = async () => {
    setIsLoading(true);
    try {
      // Nota: Este endpoint debe devolver la "foto" histórica
      const res = await api.getDailyProgressReport();
      if (res.success) {
        setLogs(res.data.students);
        setDates(res.data.dates);
      }
    } catch (e) {
      console.error('Error loading daily logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">Reporte Diario de Avance</h2>
        <p className="text-sm text-slate-400">Trazabilidad histórica del progreso por estudiante (Punto 22.4)</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50">
              <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700 sticky left-0 bg-slate-800 z-10">Estudiante</th>
              {dates.map(date => (
                <th key={date} className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700 text-center min-w-[100px]">
                  {new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((student, idx) => (
              <tr key={student.studentId} className={idx % 2 === 0 ? 'bg-slate-800/20' : ''}>
                <td className="p-4 text-sm font-bold text-white border-b border-slate-700/50 sticky left-0 bg-slate-800 z-10">
                  {student.studentName}
                </td>
                {dates.map(date => {
                  const log = student.logs.find(l => l.date === date);
                  return (
                    <td key={date} className="p-4 border-b border-slate-700/50 text-center">
                      {log ? (
                        <div className="space-y-1">
                          <div className="text-xs font-black text-green-500">{log.pct}%</div>
                          <div className="text-[9px] text-slate-500 truncate max-w-[80px] mx-auto" title={log.lastVideo}>
                            {log.lastVideo || '-'}
                          </div>
                          {log.challengesCount > 0 && (
                            <span className="inline-block px-1.5 py-0.5 bg-red-600/10 text-red-500 text-[8px] font-bold rounded">
                              {log.challengesCount} Retos
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
