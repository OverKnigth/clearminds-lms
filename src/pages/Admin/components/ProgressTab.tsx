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
  const [studentList, setStudentList] = useState<any[]>([]);
  const [viewingStudent, setViewingStudent] = useState(false);
  
  // Modal states
  const [modal, setModal] = useState<{show: boolean, type: 'confirm' | 'success' | 'error', msg: string}>({
    show: false, type: 'success', msg: ''
  });

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
      if (res.success) {
        setStudentData(res.data);
        setViewingStudent(true);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const searchByStudentName = async (q?: string) => {
    const query = q !== undefined ? q : studentSearch;
    setLoading(true);
    try {
      const res = await api.searchStudentsByName(query);
      if (res.success) {
        setStudentList(res.data);
        setViewingStudent(false);
      }
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
    if (activeReport === 'student') searchByStudentName('');
  }, [activeReport]);

  const triggerSnapshot = async () => {
    setModal({ show: true, type: 'confirm', msg: '¿Desea generar el snapshot de progreso académico diario ahora mismo?' });
  };

  const confirmSnapshot = async () => {
    setModal({ ...modal, show: false });
    setLoading(true);
    try {
      const res = await api.triggerDailyProgress();
      if (res.success) {
        setModal({ show: true, type: 'success', msg: 'Snapshot diario generado y guardado correctamente en el servidor.' });
        if (selectedGroup) {
          if (activeReport === 'group') loadGroupReport(selectedGroup);
          if (activeReport === 'daily_snapshot') loadHistorical(selectedGroup);
        }
        if (activeReport === 'daily_view') loadDailyView();
      }
    } catch { 
      setModal({ show: true, type: 'error', msg: 'Ocurrió un error crítico al intentar procesar el snapshot académico.' });
    } finally {
      setLoading(false);
    }
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
      <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-900/40 backdrop-blur-sm rounded-2xl w-fit border border-slate-700/50 mx-auto">
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
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Buscar Estudiante:</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm font-bold focus:ring-2 ring-red-500/50 outline-none w-80"
                      placeholder="Escribe el nombre del estudiante..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchByStudentName()}
                    />
                    <button onClick={() => searchByStudentName()}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-red-500 transition-all">
                      Consultar
                    </button>
                  </div>
                </div>

                {/* SEARCH RESULTS LIST - TABLE VIEW */}
                {studentList.length > 0 && !viewingStudent && (
                  <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
                    <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/50 flex justify-between items-center">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Nómina de Estudiantes</h4>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{studentList.length} Registros</span>
                    </div>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-900/30">
                          <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Estudiante</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Email</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Cursos Inscritos</th>
                          <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {studentList.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-800/10 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm font-black text-white uppercase tracking-tighter">{s.name}</div>
                            </td>
                            <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">{s.email}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {s.courses.map((c: string, idx: number) => (
                                  <span key={idx} className="px-2 py-0.5 bg-slate-800 rounded text-[8px] font-black text-slate-400 uppercase tracking-tighter border border-slate-700/30">{c}</span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => loadStudentReport(s.id)}
                                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-red-600 transition-all border border-slate-700"
                              >
                                Ver Reporte
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {studentData && viewingStudent ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button onClick={() => setViewingStudent(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all border border-slate-700/50 mb-2">
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                       Volver a la lista
                    </button>
                    {/* STUDENT SUMMARY HEADER */}
                    <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col md:flex-row items-center gap-8">
                      <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-900/40 shrink-0">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{studentData.studentName}</h3>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/30">ID: {studentData.studentId.substring(0,8)}</span>
                          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">Perfil Académico Activo</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
                        {[
                          { label: 'Videos', val: studentData.completedVideos.length, color: 'text-white' },
                          { label: 'Retos', val: studentData.deliveredChallenges.length, color: 'text-white' },
                          { label: 'Tutorías', val: studentData.tutoringSessions.length, color: 'text-white' },
                          { label: 'Bloques', val: studentData.approvedBlocks.length, color: 'text-green-500' },
                        ].map((stat, i) => (
                          <div key={i} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/30 text-center min-w-[100px]">
                            <div className={`text-xl font-black ${stat.color}`}>{stat.val}</div>
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* LEFT COLUMN: COURSES & BADGES */}
                      <div className="lg:col-span-4 space-y-6">
                        {/* BADGES TABLE */}
                        <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
                          <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/50">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Insignias Obtenidas</h4>
                          </div>
                          <div className="p-4 flex flex-wrap gap-2">
                            {studentData.badges.map((b: string, i: number) => (
                              <div key={i} className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-tighter">{b}</span>
                              </div>
                            ))}
                            {studentData.badges.length === 0 && (
                              <div className="text-[10px] text-slate-600 font-bold uppercase py-2 w-full text-center italic">Sin insignias registradas</div>
                            )}
                          </div>
                        </div>

                        {/* APPROVED BLOCKS LIST */}
                        <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
                          <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/50">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Bloques Aprobados</h4>
                          </div>
                          <div className="divide-y divide-slate-800/50">
                            {studentData.approvedBlocks.map((block: string, i: number) => (
                              <div key={i} className="px-6 py-3 flex items-center gap-3">
                                <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <span className="text-xs font-black text-slate-300 uppercase tracking-tighter">{block}</span>
                              </div>
                            ))}
                            {studentData.approvedBlocks.length === 0 && (
                              <div className="px-6 py-8 text-center text-[10px] text-slate-600 font-bold uppercase italic">Ningún bloque aprobado aún</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* RIGHT COLUMN: DETAILED TABLES */}
                      <div className="lg:col-span-8 space-y-6">
                        {/* COURSES PROGRESS TABLE */}
                        <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
                          <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/50">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Resumen de Cursos y Notas</h4>
                          </div>
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-slate-900/30">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Curso</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Progreso</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Nota Final</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                              {studentData.courses.map((c: any, i: number) => (
                                <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                                  <td className="px-6 py-4 text-xs font-black text-white uppercase">{c.courseName}</td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3 justify-center">
                                      <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-600" style={{ width: `${c.progress}%` }}></div>
                                      </div>
                                      <span className="text-[10px] font-black text-slate-400">{c.progress}%</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <span className={`text-sm font-black ${Number(c.grade) >= 7 ? 'text-green-500' : 'text-slate-500'}`}>
                                      {c.grade || 'N/A'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* TUTORING SESSIONS TABLE */}
                        <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
                          <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/50 flex justify-between items-center">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Sesiones de Tutoría Realizadas</h4>
                          </div>
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-slate-900/30">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Bloque / Módulo</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Fecha</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                              {studentData.tutoringSessions.map((ts: any, i: number) => (
                                <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                                  <td className="px-6 py-4 text-xs font-bold text-slate-300 uppercase">{ts.block}</td>
                                  <td className="px-6 py-4 text-center">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{new Date(ts.date).toLocaleDateString()}</span>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${ts.status === 'executed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                      {ts.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {studentData.tutoringSessions.length === 0 && (
                                <tr><td colSpan={3} className="px-6 py-8 text-center text-[10px] text-slate-600 font-bold uppercase italic tracking-widest">Sin sesiones registradas</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* CHALLENGES SUBMITTED TABLE */}
                        <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
                          <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/50 flex justify-between items-center">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Retos y Entregas Académicas</h4>
                          </div>
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-slate-900/30">
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Reto / Actividad</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Calificación</th>
                                <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                              {studentData.deliveredChallenges.map((cs: any, i: number) => (
                                <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                                  <td className="px-6 py-4 text-xs font-bold text-slate-300 uppercase underline decoration-slate-700 decoration-dotted underline-offset-4">{cs.topic}</td>
                                  <td className="px-6 py-4 text-center font-black text-white">
                                    {cs.grade !== null ? cs.grade : '-'}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${cs.grade >= 7 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                      {cs.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {studentData.deliveredChallenges.length === 0 && (
                                <tr><td colSpan={3} className="px-6 py-8 text-center text-[10px] text-slate-600 font-bold uppercase italic tracking-widest">Sin retos entregados</td></tr>
                              )}
                            </tbody>
                          </table>
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
              <div className="space-y-8">
                {/* FORMAL GLOBAL METRICS TABLE */}
                <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
                  <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/50">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Reporte de Gestión de Tutorías</h3>
                  </div>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-900/30">
                        <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest w-1/3">Concepto</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Contador</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Estado Administrativo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {[
                        { label: 'Solicitudes', val: tutoringData?.requested, desc: 'Pendientes de procesamiento inicial' },
                        { label: 'Confirmadas', val: tutoringData?.confirmed, desc: 'Con horario y fecha establecida' },
                        { label: 'Ejecutadas', val: tutoringData?.executed, desc: 'Sesiones finalizadas en aula' },
                        { label: 'Reagendadas', val: tutoringData?.rescheduled, desc: 'Con modificación de cita previa' },
                        { label: 'Aprobadas', val: tutoringData?.approved, desc: 'Validación académica satisfactoria' },
                        { label: 'No aprobadas', val: tutoringData?.notApproved, desc: 'Requieren refuerzo académico' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-800/10 transition-colors">
                          <td className="px-6 py-4 text-xs font-black text-white uppercase tracking-tighter">{row.label}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-xl font-black text-white">{row.val ?? 0}</span>
                          </td>
                          <td className="px-6 py-4 text-[10px] text-slate-400 font-bold uppercase tracking-tight">{row.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                    <table className="w-full text-left whitespace-nowrap">
                      <thead>
                        <tr className="bg-slate-800/70 border-b border-slate-700/50">
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudiante</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Curso/Grupo</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Módulo Actual</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Último Video</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">% Avance</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Retos</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tutoría</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Observación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {historicalData.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-800/30 transition-all text-[11px]">
                            <td className="px-6 py-4 font-bold text-slate-400">{row.date}</td>
                            <td className="px-6 py-4">
                              <div className="font-black text-white uppercase">{row.userNames} {row.userLastNames}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="text-[10px] text-slate-500 font-bold uppercase">{row.courseName}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                               <span className="px-2 py-1 bg-slate-800 rounded text-slate-300 font-bold uppercase">{row.currentBlock || '-'}</span>
                            </td>
                            <td className="px-6 py-4 text-center text-slate-400 max-w-[150px] truncate" title={row.lastContent}>{row.lastContent || '-'}</td>
                            <td className="px-6 py-4 text-center font-black text-white">{row.progressPct}%</td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-white font-black">{row.challenges}</span>
                            </td>
                            <td className="px-6 py-4 text-center uppercase font-bold text-slate-500">{row.tutoring || '-'}</td>
                            <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate italic">{row.observations || 'Sin observaciones'}</td>
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

      {/* CUSTOM FORMAL MODAL */}
      {modal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-700/50 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center gap-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                modal.type === 'confirm' ? 'bg-red-600/10 text-red-500' :
                modal.type === 'success' ? 'bg-green-600/10 text-green-500' : 'bg-slate-800 text-slate-400'
              }`}>
                {modal.type === 'confirm' && (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
                {modal.type === 'success' && (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                )}
                {modal.type === 'error' && (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                  {modal.type === 'confirm' ? 'Confirmar Acción' : modal.type === 'success' ? 'Éxito' : 'Mensaje del Sistema'}
                </h3>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-tight leading-relaxed">
                  {modal.msg}
                </p>
              </div>

              <div className="flex gap-3 w-full">
                {modal.type === 'confirm' ? (
                  <>
                    <button onClick={() => setModal({ ...modal, show: false })} className="flex-1 px-6 py-3 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700">Cancelar</button>
                    <button onClick={confirmSnapshot} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-900/20">Ejecutar</button>
                  </>
                ) : (
                  <button onClick={() => setModal({ ...modal, show: false })} className="w-full px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">Aceptar y Continuar</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
