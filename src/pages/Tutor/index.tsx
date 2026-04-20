import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { useTutorData } from './hooks/useTutorData';
import { SessionCard, StudentsTab, ChallengesTab } from './components';
import TutoringCalendar from '../../components/TutoringCalendar';
import type { TutorTab } from './types';

export default function Tutor() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = (queryParams.get('tab') as TutorTab) || 'dashboard';
  const { sessions, pending, upcoming, completed, students, challenges, stats, isLoading, fetchSessions, fetchAll } = useTutorData();
  const [globalMessage, setGlobalMessage] = useState('');

  useEffect(() => {
    api.getTutoringConfig().then(res => {
      if (res.success && res.data.globalMessage) setGlobalMessage(res.data.globalMessage);
    }).catch(() => {});
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Derived data for dashboard
  const pendingGrade = completed.filter(s => s.status === 'executed' && s.grade === null);
  const pendingChallenges = challenges.filter(c => c.status === 'submitted');

  return (
    <div className="min-h-screen bg-slate-900 pt-8">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Admin global message */}
        {globalMessage && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Aviso del Administrador</p>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{globalMessage}</p>
            </div>
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700/50 rounded-lg px-6 py-4">
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Dashboard</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Resumen de tu actividad como tutor</p>
            </div>

            {/* 6 stat cards — spec 20 */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {[
                { label: 'Pendientes de confirmar', value: pending.length, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', tab: 'pending' },
                { label: 'Tutorías próximas', value: upcoming.length, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', tab: 'upcoming' },
                { label: 'Pendientes de calificar', value: pendingGrade.length, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', tab: 'completed' },
                { label: 'Estudiantes', value: students.length, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', tab: 'students' },
                { label: 'Retos por revisar', value: pendingChallenges.length, icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', tab: 'challenges' },
                { label: 'Rating', value: stats.rating > 0 ? stats.rating.toFixed(1) : '-', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', tab: null },
              ].map(({ label, value, icon, color, bg, border, tab }) => (
                tab ? (
                  <a key={label} href={`/tutor?tab=${tab}`}
                    className={`${bg} rounded-lg p-4 border ${border} flex flex-col items-center text-center gap-2 hover:opacity-80 transition-opacity cursor-pointer`}>
                    <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                    </svg>
                    <p className={`text-2xl font-black ${color}`}>{value}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-tight">{label}</p>
                  </a>
                ) : (
                  <div key={label} className={`${bg} rounded-lg p-4 border ${border} flex flex-col items-center text-center gap-2`}>
                    <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                    </svg>
                    <p className={`text-2xl font-black ${color}`}>{value}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-tight">{label}</p>
                    <p className="text-[9px] text-slate-600">({stats.reviewsCount} reseñas)</p>
                  </div>
                )
              ))}
            </div>

            {/* Bottom grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Tutorías pendientes de confirmar */}
              <div className="bg-slate-800 border border-slate-700/50 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendientes de confirmar</p>
                  {pending.length > 3 && (
                    <a href="/tutor?tab=pending" className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest">Ver todas →</a>
                  )}
                </div>
                {pending.length === 0 ? (
                  <p className="px-5 py-8 text-center text-[10px] text-slate-600 uppercase font-black">Sin solicitudes pendientes</p>
                ) : (
                  <div className="divide-y divide-slate-700/30">
                    {pending.slice(0, 3).map(s => (
                      <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white uppercase tracking-tighter truncate">{s.student?.names} {s.student?.lastNames}</p>
                          <p className="text-[10px] text-slate-500 truncate">{s.block?.name} — {s.block?.course?.name}</p>
                        </div>
                        <span className="text-[9px] font-black text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20 shrink-0">Pendiente</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tutorías próximas */}
              <div className="bg-slate-800 border border-slate-700/50 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próximas tutorías</p>
                  {upcoming.length > 3 && (
                    <a href="/tutor?tab=upcoming" className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest">Ver todas →</a>
                  )}
                </div>
                {upcoming.length === 0 ? (
                  <p className="px-5 py-8 text-center text-[10px] text-slate-600 uppercase font-black">Sin tutorías próximas</p>
                ) : (
                  <div className="divide-y divide-slate-700/30">
                    {upcoming.slice(0, 3).map(s => (
                      <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white uppercase tracking-tighter truncate">{s.student?.names} {s.student?.lastNames}</p>
                          <p className="text-[10px] text-slate-500 truncate">{s.scheduledAt ? new Date(s.scheduledAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) : 'Sin fecha'}</p>
                        </div>
                        <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 shrink-0">Confirmada</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Retos pendientes de revisión */}
              <div className="bg-slate-800 border border-slate-700/50 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retos por revisar</p>
                  {pendingChallenges.length > 4 && (
                    <a href="/tutor?tab=challenges" className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest">Ver todos →</a>
                  )}
                </div>
                {pendingChallenges.length === 0 ? (
                  <p className="px-5 py-8 text-center text-[10px] text-slate-600 uppercase font-black">Sin retos pendientes</p>
                ) : (
                  <div className="divide-y divide-slate-700/30">
                    {pendingChallenges.slice(0, 4).map(c => (
                      <div key={c.id} className="px-5 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white uppercase tracking-tighter truncate">{c.student?.names} {c.student?.lastNames}</p>
                          <p className="text-[10px] text-slate-500 truncate">{c.content?.title}</p>
                        </div>
                        <span className="text-[9px] font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 shrink-0">Entregado</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Estudiantes por bloque */}
              <div className="bg-slate-800 border border-slate-700/50 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estudiantes por curso</p>
                  {students.length > 5 && (
                    <a href="/tutor?tab=students" className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest">Ver todos →</a>
                  )}
                </div>
                {students.length === 0 ? (
                  <p className="px-5 py-8 text-center text-[10px] text-slate-600 uppercase font-black">Sin estudiantes asignados</p>
                ) : (
                  <div className="divide-y divide-slate-700/30">
                    {students.slice(0, 5).map((s: any) => (
                      <div key={s.id} className="px-5 py-3 flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-600 to-cyan-700 flex items-center justify-center text-white text-[9px] font-black shrink-0">
                          {s.names?.[0]}{s.lastNames?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-white uppercase tracking-tighter truncate">{s.names} {s.lastNames}</p>
                          <p className="text-[10px] text-slate-500 truncate">{s.course?.name}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-black text-green-400">{s.progress?.pct ?? 0}%</p>
                          <p className="text-[9px] text-slate-600">avance</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ── TABS ── */}
        {activeTab !== 'dashboard' && (
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                {activeTab === 'pending' && 'Tutorías Pendientes'}
                {activeTab === 'upcoming' && 'Próximas Tutorías'}
                {activeTab === 'completed' && 'Tutorías Realizadas'}
                {activeTab === 'students' && 'Mis Estudiantes'}
                {activeTab === 'calendar' && 'Calendario de Tutorías'}
                {activeTab === 'challenges' && 'Retos por Revisar'}
              </h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                {activeTab === 'pending' && 'Confirma o rechaza las nuevas solicitudes de tutoría'}
                {activeTab === 'upcoming' && 'Sesiones programadas para los próximos días'}
                {activeTab === 'completed' && 'Historial de sesiones ejecutadas y calificaciones'}
                {activeTab === 'students' && 'Listado oficial de estudiantes bajo tu tutoría'}
                {activeTab === 'calendar' && 'Vista mensual de todas tus sesiones programadas'} 
                {activeTab === 'challenges' && 'Valida los retos entregados por tus estudiantes'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          pending.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pending.map(s => <SessionCard key={s.id} session={s} onRefresh={fetchSessions} />)}
            </div>
          ) : <EmptyState message="No hay tutorías pendientes" />
        )}

        {activeTab === 'upcoming' && (
          upcoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map(s => <SessionCard key={s.id} session={s} onRefresh={fetchSessions} />)}
            </div>
          ) : <EmptyState message="No hay tutorías próximas" />
        )}

        {activeTab === 'completed' && (
          completed.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completed.map(s => <SessionCard key={s.id} session={s} onRefresh={fetchSessions} />)}
            </div>
          ) : <EmptyState message="No hay tutorías completadas" />
        )}

        {activeTab === 'students' && <StudentsTab students={students} />}

        {activeTab === 'challenges' && <ChallengesTab challenges={challenges} onRefresh={fetchAll} />}

        {activeTab === 'calendar' && (
          <TutoringCalendar 
            sessions={sessions} 
            isLoading={isLoading} 
          />
        )}
      </div>
      <Footer />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-xl">
      <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="text-slate-400">{message}</p>
    </div>
  );
}
