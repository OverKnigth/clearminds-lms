import { useState, useEffect } from 'react';
import { api } from '../../../services/api';

export function ProgressTab() {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const res = await api.getAllGroups();
      if (res.success && res.data) {
        // filter out internal "direct_" groups if preferred or show them
        const list = res.data.rows || res.data || [];
        setGroups(list.filter((g: any) => g.status === 'active'));
      }
    } catch (e) {
      console.error('Error cargando grupos:', e);
    }
  };

  const loadHistorical = async (groupId: string) => {
    setIsLoading(true);
    setSelectedGroup(groupId);
    try {
      const res = await api.getGroupHistoricalReport(groupId);
      if (res.success) {
        setHistoricalData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const manuallyTrigger = async () => {
    if (!confirm('¿Generar memoria fotográfica del progreso diario justo ahora?')) return;
    try {
      const res = await api.triggerDailyProgress();
      if (res.success) {
        alert(res.message);
        if (selectedGroup) loadHistorical(selectedGroup);
      }
    } catch (e: any) {
      alert('Error ejecutando tarea.');
    }
  };

  const matrix: any = {};
  const uniqueDates = new Set<string>();

  historicalData.forEach((row: any) => {
    const key = `${row.userId}_${row.courseId}`;
    if (!matrix[key]) {
      matrix[key] = {
        studentName: `${row.userNames} ${row.userLastNames}`,
        courseName: row.courseName,
        days: {}
      };
    }
    uniqueDates.add(row.date);
    matrix[key].days[row.date] = row;
  });

  const datesArray = Array.from(uniqueDates).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-700 pb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Reporte Diario Histórico de Avance</h2>
          <p className="text-sm text-slate-400">Selecciona un grupo para su matriz diaria de avance por estudiante. (Ideal para reuniones operativas de seguimiento)</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white font-medium"
            value={selectedGroup}
            onChange={(e) => loadHistorical(e.target.value)}
          >
            <option value="">-- Seleccionar Grupo / Cohorte --</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name} - {g.cohort}</option>)}
          </select>
          <button 
            onClick={manuallyTrigger} 
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg transition-all font-bold flex items-center shadow-lg shadow-red-900/20 text-sm"
          >
            Disparar Cron Snapshot Ahora
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">Construyendo matriz histórica computada...</div>
      ) : selectedGroup && Object.keys(matrix).length > 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-x-auto shadow-xl">
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
                      <td key={date} className="px-4 py-2 text-center border-l border-slate-700/30" title={`Retos entregados: ${d.challenges} | Tutoría: ${d.tutoring} | Último contenido: ${d.lastContent}`}>
                        <span className="font-bold text-white text-base">{d.progressPct}%</span>
                        <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[80px]" title={d.currentBlock || '-'}>{d.currentBlock || '-'}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selectedGroup ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-800/50 border border-dashed border-slate-700 rounded-2xl">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-slate-300 font-medium mb-1">No hay datos históricos en este grupo.</p>
          <p className="text-slate-500 text-sm max-w-sm text-center">Todavía no ha pasado el cron a la medianoche con estudiantes activos o no se ha disparado manualmente.</p>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center border border-slate-700 rounded-2xl bg-slate-800/20">
          <p className="text-slate-400 font-medium bg-slate-800 px-6 py-3 rounded-xl shadow-lg border border-slate-700">Selecciona un grupo en la esquina superior derecha para cargar el reporte.</p>
        </div>
      )}
    </div>
  );
}
