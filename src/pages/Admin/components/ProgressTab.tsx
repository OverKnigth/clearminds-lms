import { useState, useEffect } from 'react';
import { api } from '../../../services/api';

export function ProgressTab() {
  const [subTab, setSubTab] = useState<'historical' | 'daily'>('historical');

  // ── Historical (por grupo) ────────────────────────────────────────────────
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [histLoading, setHistLoading] = useState(false);

  // ── Daily (todos los estudiantes) ─────────────────────────────────────────
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);
  const [dailyDates, setDailyDates] = useState<string[]>([]);
  const [dailyLoading, setDailyLoading] = useState(false);

  useEffect(() => {
    api.getAllGroups().then(res => {
      if (res.success) {
        const list = res.data.rows || res.data || [];
        setGroups(list.filter((g: any) => g.status === 'active'));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (subTab === 'daily' && dailyLogs.length === 0) loadDailyLogs();
  }, [subTab]);

  const loadHistorical = async (groupId: string) => {
    setHistLoading(true);
    setSelectedGroup(groupId);
    try {
      const res = await api.getGroupHistoricalReport(groupId);
      if (res.success) setHistoricalData(res.data);
    } catch (e) { console.error(e); }
    finally { setHistLoading(false); }
  };

  const loadDailyLogs = async () => {
    setDailyLoading(true);
    try {
      const res = await api.getDailyProgressReport();
      if (res.success) {
        setDailyLogs(res.data.students);
        setDailyDates(res.data.dates);
      }
    } catch (e) { console.error(e); }
    finally { setDailyLoading(false); }
  };

  const triggerSnapshot = async () => {
    if (!confirm('¿Generar snapshot del progreso diario ahora?')) return;
    try {
      const res = await api.triggerDailyProgress();
      if (res.success) {
        alert(res.message);
        if (selectedGroup) loadHistorical(selectedGroup);
        if (subTab === 'daily') loadDailyLogs();
      }
    } catch { alert('Error ejecutando tarea.'); }
  };

  // Build matrix for historical tab
  const matrix: any = {};
  const uniqueDates = new Set<string>();
  historicalData.forEach((row: any) => {
    const key = `${row.userId}_${row.courseId}`;
    if (!matrix[key]) matrix[key] = { studentName: `${row.userNames} ${row.userLastNames}`, courseName: row.courseName, days: {} };
    uniqueDates.add(row.date);
    matrix[key].days[row.date] = row;
  });
  const datesArray = Array.from(uniqueDates).sort();

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-800 border border-slate-700/50 rounded-lg px-6 py-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Progreso</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Seguimiento y trazabilidad del avance académico</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={triggerSnapshot}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-900/20">
            Snapshot Ahora
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 p-1 bg-slate-800 rounded-xl w-fit border border-slate-700">
        <button onClick={() => setSubTab('historical')}
          className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${subTab === 'historical' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
          Histórico por Grupo
        </button>
        <button onClick={() => setSubTab('daily')}
          className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${subTab === 'daily' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
          Reporte Diario
        </button>
      </div>

      {/* ── HISTÓRICO ── */}
      {subTab === 'historical' && (
        <div className="space-y-4">
          <select
            className="px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm font-bold"
            value={selectedGroup}
            onChange={(e) => loadHistorical(e.target.value)}
          >
            <option value="">-- Seleccionar Grupo / Cohorte --</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name} - {g.cohort}</option>)}
          </select>

          {histLoading ? (
            <div className="text-center py-12 text-slate-400 animate-pulse text-sm">Construyendo matriz histórica...</div>
          ) : selectedGroup && Object.keys(matrix).length > 0 ? (
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto shadow-xl">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-700/50 uppercase text-[10px] tracking-wider font-bold text-slate-400">
                  <tr>
                    <th className="px-4 py-4 whitespace-nowrap border-b border-slate-600">Estudiante</th>
                    <th className="px-4 py-4 whitespace-nowrap border-b border-slate-600">Curso</th>
                    {datesArray.map(date => (
                      <th key={date} className="px-4 py-4 whitespace-nowrap border-b border-slate-600 text-center">{date.substring(5)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {Object.values(matrix).map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{row.studentName}</td>
                      <td className="px-4 py-3 text-red-300 whitespace-nowrap text-xs">{row.courseName}</td>
                      {datesArray.map(date => {
                        const d = row.days[date];
                        if (!d) return <td key={date} className="px-4 py-3 text-center text-slate-600">-</td>;
                        return (
                          <td key={date} className="px-4 py-2 text-center border-l border-slate-700/30" title={`Retos: ${d.challenges} | Tutoría: ${d.tutoring}`}>
                            <span className="font-bold text-white text-base">{d.progressPct}%</span>
                            <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[80px]">{d.currentBlock || '-'}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedGroup ? (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-800/50 border border-dashed border-slate-700 rounded-lg">
              <span className="text-3xl mb-3">📊</span>
              <p className="text-slate-300 font-bold text-sm">Sin datos históricos en este grupo</p>
              <p className="text-slate-500 text-xs mt-1 text-center max-w-sm">Aún no se ha ejecutado el cron o no hay estudiantes activos.</p>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center border border-slate-700 rounded-lg bg-slate-800/20">
              <p className="text-slate-400 text-sm font-bold">Selecciona un grupo para cargar el reporte</p>
            </div>
          )}
        </div>
      )}

      {/* ── DIARIO ── */}
      {subTab === 'daily' && (
        dailyLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50">
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700 sticky left-0 bg-slate-800 z-10">Estudiante</th>
                    {dailyDates.map(date => (
                      <th key={date} className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-700 text-center min-w-[100px]">
                        {new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dailyLogs.length === 0 ? (
                    <tr><td colSpan={dailyDates.length + 1} className="p-12 text-center text-slate-500 text-sm font-bold">Sin datos de progreso diario</td></tr>
                  ) : dailyLogs.map((student: any, idx: number) => (
                    <tr key={student.studentId} className={idx % 2 === 0 ? 'bg-slate-800/20' : ''}>
                      <td className="p-4 text-sm font-bold text-white border-b border-slate-700/50 sticky left-0 bg-slate-800 z-10">{student.studentName}</td>
                      {dailyDates.map(date => {
                        const log = student.logs?.find((l: any) => l.date === date);
                        return (
                          <td key={date} className="p-4 border-b border-slate-700/50 text-center">
                            {log ? (
                              <div className="space-y-1">
                                <div className="text-xs font-black text-green-500">{log.pct}%</div>
                                <div className="text-[9px] text-slate-500 truncate max-w-[80px] mx-auto">{log.lastVideo || '-'}</div>
                                {log.challengesCount > 0 && (
                                  <span className="inline-block px-1.5 py-0.5 bg-red-600/10 text-red-500 text-[8px] font-bold rounded">{log.challengesCount} Retos</span>
                                )}
                              </div>
                            ) : <span className="text-slate-600">-</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
