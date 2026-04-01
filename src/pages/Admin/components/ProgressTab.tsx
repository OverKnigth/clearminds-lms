import { useState, useEffect } from 'react';
import { api } from '../../../services/api';

type ReportType = 'group' | 'student' | 'tutoring' | 'daily_snapshot' | 'daily_view';

export function ProgressTab() {
  const [activeReport, setActiveReport] = useState<ReportType>('group');
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Data states
  const [groupData, setGroupData] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentData, setStudentData] = useState<any>(null);
  const [tutoringData, setTutoringData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [dailyViewData, setDailyViewData] = useState<any>({ students: [], dates: [] });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const res = await api.getAllGroups();
      if (res.success) {
        const list = res.data.rows || res.data || [];
        setGroups(list.filter((g: any) => g.status === 'active' && g.name !== '__template__'));
      }
    } catch (e) {
      console.error('Error loading groups', e);
    }
  };

  const loadGroupReport = async (groupId: string) => {
    setLoading(true);
    setSelectedGroup(groupId);
    try {
      const res = await api.getCourseGroupDetail(groupId);
      if (res.success) setGroupData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadStudentReport = async (userId: string) => {
    setLoading(true);
    try {
      const res = await api.getStudentDetailReport(userId);
      if (res.success) setStudentData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadTutoringReport = async () => {
    setLoading(true);
    try {
      const res = await api.getTutoringMetricsReport();
      if (res.success) setTutoringData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadHistorical = async (groupId: string) => {
    setLoading(true);
    setSelectedGroup(groupId);
    try {
      const res = await api.getGroupHistoricalReport(groupId);
      if (res.success) setHistoricalData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadDailyView = async () => {
    setLoading(true);
    try {
      const res = await api.getDailyProgressReport();
      if (res.success) setDailyViewData(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeReport === 'tutoring') loadTutoringReport();
    if (activeReport === 'daily_view') loadDailyView();
  }, [activeReport]);

  const triggerSnapshot = async () => {
    if (!confirm('¿Generar snapshot del progreso diario ahora?')) return;
    try {
      const res = await api.triggerDailyProgress();
      if (res.success) {
        alert(res.message);
        if (selectedGroup) {
          if (activeReport === 'group') loadGroupReport(selectedGroup);
          if (activeReport === 'daily_snapshot') loadHistorical(selectedGroup);
        }
        if (activeReport === 'daily_view') loadDailyView();
      }
    } catch { alert('Error ejecutando tarea.'); }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl px-8 py-6 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Central de Reportes</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Módulo de Seguimiento Académico y Progreso</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={triggerSnapshot}
            className="group relative px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl overflow-hidden flex items-center gap-2">
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Generar Snapshot
            </span>
            <div className="absolute inset-0 bg-slate-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/40 backdrop-blur-sm rounded-2xl w-fit border border-slate-700/50">
        {[
          { id: 'group', label: 'Curso / Grupo', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
          { id: 'student', label: 'Estudiante', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
          { id: 'tutoring', label: 'Tutorías', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
          { id: 'daily_snapshot', label: 'Snapshot Histórico', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
          { id: 'daily_view', label: 'Vista Operativa', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id as ReportType)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-none ${
              activeReport === tab.id
                ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-900/40 ring-1 ring-red-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px] transition-all duration-500">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-red-500/10 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-black text-xs uppercase tracking-[0.3em] animate-pulse">Procesando Reporte...</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* 22.1 REPORT POR GRUPO */}
            {activeReport === 'group' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Seleccionar Grupo:</span>
                  <select
                    className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm font-bold focus:ring-2 ring-red-500/50 outline-none transition-all"
                    value={selectedGroup}
                    onChange={(e) => loadGroupReport(e.target.value)}
                  >
                    <option value="">-- Elige un grupo --</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name} - {g.cohort}</option>)}
                  </select>
                </div>

                {groupData.length > 0 ? (
                  <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-800/70">
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estudiante</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Progreso</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Bloques</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Tutorías</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Insignias</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Nota</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {groupData.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="font-bold text-white group-hover:text-red-400 transition-colors">{row.studentName}</div>
                              <div className="text-[9px] text-slate-500 uppercase font-black tracking-tighter mt-1">{row.studentId.substring(0,8)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col items-center gap-2">
                                <div className="text-sm font-black text-white">{row.progress}%</div>
                                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-red-600 transition-all duration-1000" style={{ width: `${row.progress}%` }}></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap justify-center gap-1">
                                {row.blocks.map((b: any, bi: number) => (
                                  <span key={bi} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${b.approved ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-slate-700/30 text-slate-500 border border-slate-700/30'}`}>
                                    {b.name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="text-xs font-bold text-slate-300">{row.tutorings.length}</div>
                              <div className="text-[9px] text-slate-500 font-bold uppercase">Sesiones</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center gap-1">
                                {row.badges.map((b: any, bi: number) => (
                                  <div key={bi} title={b} className="w-6 h-6 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/30">
                                    <svg className="w-3.5 h-3.5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                  </div>
                                ))}
                                {row.badges.length === 0 && <span className="text-slate-600">-</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`text-sm font-black ${row.grade >= 7 ? 'text-green-500' : 'text-red-500'}`}>
                                {row.grade ? row.grade.toFixed(1) : '-'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-2xl p-16 flex flex-col items-center justify-center gap-4">
                    <svg className="w-16 h-16 text-slate-700 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Selecciona un grupo para ver el reporte</p>
                  </div>
                )}
              </div>
            )}

            {/* 22.2 REPORT POR ESTUDIANTE */}
            {activeReport === 'student' && (
              <div className="space-y-6">
                 <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Buscar Estudiante (ID):</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm font-bold focus:ring-2 ring-red-500/50 outline-none w-80"
                      placeholder="Identificador del estudiante..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />
                    <button onClick={() => loadStudentReport(studentSearch)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-red-500 transition-all">
                      Consultar
                    </button>
                  </div>
                </div>

                {studentData ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Sidebar info */}
                    <div className="md:col-span-4 space-y-6">
                      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                        <div className="text-center space-y-4">
                          <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-red-900/40">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-white uppercase">{studentData.studentName}</h3>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Perfil del Estudiante</p>
                          </div>
                        </div>
                        <div className="mt-8 space-y-4">
                          <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-xl">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Videos Completados</span>
                            <span className="text-xs font-black text-white">{studentData.completedVideos.length}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-xl">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Retos Entregados</span>
                            <span className="text-xs font-black text-white">{studentData.deliveredChallenges.length}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-xl">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Bloques Aprobados</span>
                            <span className="text-xs font-black text-green-400">{studentData.approvedBlocks.length}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                        <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-4">Insignias Obtenidas</h4>
                        <div className="flex flex-wrap gap-2">
                          {studentData.badges.map((b: string, i: number) => (
                            <div key={i} className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                              <span className="text-[10px] font-black text-yellow-500 uppercase">{b}</span>
                            </div>
                          ))}
                          {studentData.badges.length === 0 && <p className="text-slate-600 text-xs italic">Ninguna insignia aún</p>}
                        </div>
                      </div>
                    </div>

                    {/* Main content info */}
                    <div className="md:col-span-8 space-y-6">
                      <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
                        <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/50 flex justify-between items-center">
                          <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Cursos Inscritos</h4>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {studentData.courses.map((c: any, i: number) => (
                            <div key={i} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 flex flex-col gap-3">
                              <div className="font-black text-xs text-white uppercase">{c.courseName}</div>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                                  <div className="h-full bg-red-600" style={{ width: `${c.progress}%` }}></div>
                                </div>
                                <span className="text-[10px] font-black text-red-400">{c.progress}%</span>
                              </div>
                              <div className="text-[9px] font-bold text-slate-500 uppercase">Nota Final: <span className="text-white">{c.grade || 'N/A'}</span></div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
                        <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/50">
                          <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Tutorías y Retos</h4>
                        </div>
                        <div className="p-6 space-y-6">
                          <div>
                            <h5 className="text-[9px] font-black text-slate-400 uppercase mb-3 px-2">Sesiones de Tutoría</h5>
                            <div className="space-y-2">
                              {studentData.tutoringSessions.map((ts: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-800/20 rounded-xl border border-slate-700/20 hover:border-red-500/30 transition-all">
                                  <div>
                                    <div className="text-xs font-bold text-white">{ts.block}</div>
                                    <div className="text-[9px] text-slate-500">{new Date(ts.date).toLocaleDateString()}</div>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${ts.status === 'executed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                    {ts.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                   <div className="bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-2xl p-16 flex flex-col items-center justify-center gap-4">
                    <svg className="w-16 h-16 text-slate-700 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Busca un estudiante para ver su avance individual</p>
                  </div>
                )}
              </div>
            )}

            {/* 22.3 REPORT DE TUTORÍAS */}
            {activeReport === 'tutoring' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { label: 'Solicitudes', val: tutoringData?.requested, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Confirmadas', val: tutoringData?.confirmed, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                    { label: 'Ejecutadas', val: tutoringData?.executed, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Reagendadas', val: tutoringData?.rescheduled, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                    { label: 'Aprobadas', val: tutoringData?.approved, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'No Aprobadas', val: tutoringData?.notApproved, color: 'text-red-500', bg: 'bg-red-500/10' },
                  ].map((stat, i) => (
                    <div key={i} className={`p-8 rounded-2xl border border-slate-700/50 shadow-xl ${stat.bg} flex flex-col items-center gap-2`}>
                      <span className={`text-4xl font-black ${stat.color}`}>{stat.val ?? 0}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-700/50 text-center">
                  <p className="text-slate-500 text-xs italic">El reporte de tutorías muestra métricas agregadas del rendimiento y cumplimiento de asistencia.</p>
                </div>
              </div>
            )}

            {/* 22.4 REPORT DIARIO SNAPSHOT */}
            {activeReport === 'daily_snapshot' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Grupo Histórico:</span>
                  <select
                    className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm font-bold"
                    value={selectedGroup}
                    onChange={(e) => loadHistorical(e.target.value)}
                  >
                    <option value="">-- Elige un grupo --</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name} - {g.cohort}</option>)}
                  </select>
                </div>

                {historicalData.length > 0 ? (
                  <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 overflow-x-auto shadow-2xl">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-800/70 border-b border-slate-700/50">
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudiante</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Fecha</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Último Video</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">% Avance</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Retos</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tutoría</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Obs</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {historicalData.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-800/30 transition-all text-sm">
                            <td className="px-6 py-4">
                              <div className="font-bold text-white">{row.userNames} {row.userLastNames}</div>
                              <div className="text-[10px] text-red-400 font-bold">{row.courseName}</div>
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-slate-300">{row.date}</td>
                            <td className="px-6 py-4 text-center text-xs text-slate-400 max-w-[150px] truncate" title={row.lastContent}>{row.lastContent || '-'}</td>
                            <td className="px-6 py-4 text-center font-black text-white">{row.progressPct}%</td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-2 py-1 bg-slate-800 rounded font-bold text-slate-300">{row.challenges}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${row.tutoring === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-slate-700/50 text-slate-500'}`}>
                                {row.tutoring || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate">{row.observations || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                   <div className="h-64 flex flex-col items-center justify-center bg-slate-800/20 border-2 border-dashed border-slate-700 rounded-2xl opacity-50">
                     <svg className="w-12 h-12 text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                     <p className="text-xs font-black uppercase tracking-widest text-slate-500">Sin datos históricos para este grupo</p>
                  </div>
                )}
              </div>
            )}

            {/* 22.5 VISTA OPERATIVA (GRID) */}
            {activeReport === 'daily_view' && (
              <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-800/70 border-b border-slate-700/50">
                          <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-900 z-10 border-r border-slate-700/50">Estudiante</th>
                          {dailyViewData.dates.map((date: string) => (
                            <th key={date} className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center min-w-[120px] border-r border-slate-800/30">
                              {new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dailyViewData.students.length === 0 ? (
                          <tr><td colSpan={dailyViewData.dates.length + 1} className="p-20 text-center text-slate-500 text-xs font-black uppercase tracking-widest">Sin datos de cierre diario</td></tr>
                        ) : dailyViewData.students.map((student: any, idx: number) => (
                          <tr key={student.studentId} className={idx % 2 === 0 ? 'bg-slate-800/10' : ''}>
                            <td className="p-5 text-sm font-black text-white sticky left-0 bg-slate-900 z-10 border-r border-slate-700/50 whitespace-nowrap">{student.studentName}</td>
                            {dailyViewData.dates.map((date: string) => {
                              const log = student.logs?.find((l: any) => l.date === date);
                              return (
                                <td key={date} className="p-4 border-r border-slate-800/30 text-center">
                                  {log ? (
                                    <div className="space-y-1.5">
                                      <div className="text-base font-black text-red-500 leading-none">{log.pct}%</div>
                                      <div className="text-[8px] text-slate-500 font-bold uppercase truncate max-w-[90px] mx-auto opacity-70">{log.lastVideo || '-'}</div>
                                      {log.challengesCount > 0 && (
                                        <div className="flex justify-center">
                                          <span className="px-1.5 py-0.5 bg-green-500 text-slate-900 text-[8px] font-black rounded">+{log.challengesCount} R</span>
                                        </div>
                                      )}
                                    </div>
                                  ) : <span className="text-slate-700 font-bold text-xs">-</span>}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
