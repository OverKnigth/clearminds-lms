import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { useTutorData } from './hooks/useTutorData';
import { StudentsTab, ChallengesTab, TutoringSessionsTable, TutorModuleFilters } from './components';
import TutoringCalendar from '../../components/TutoringCalendar';
import type { TutorTab } from './types';

export default function Tutor() {
  const TUTORING_PAGE_SIZE = 20;
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const rawTab = queryParams.get('tab');
  const activeTab: TutorTab =
    rawTab === 'upcoming' ? 'confirmed' :
    rawTab === 'challenges' ? 'challenge-pending' :
    ((rawTab as TutorTab) || 'dashboard');

  const { sessions, pending, upcoming, completed, students, challenges, stats, isLoading, fetchSessions, fetchAll } = useTutorData();
  const [globalMessage, setGlobalMessage] = useState('');
  const [reportType, setReportType] = useState<'tutorias' | 'retos'>('tutorias');
  const [moduleFilters, setModuleFilters] = useState({ name: '', email: '', course: '' });
  const [pendingPage, setPendingPage] = useState(1);
  const [confirmedPage, setConfirmedPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [pendingChallengesPage, setPendingChallengesPage] = useState(1);
  const [gradedChallengesPage, setGradedChallengesPage] = useState(1);

  const normalize = (value?: string | null) => (value ?? '').toLowerCase().trim();
  const contains = (target?: string | null, query?: string) =>
    !query || normalize(target).includes(normalize(query));

  const matchesSessionFilters = (session: any) =>
    contains(`${session.student?.names ?? ''} ${session.student?.lastNames ?? ''}`, moduleFilters.name) &&
    contains(session.student?.email, moduleFilters.email) &&
    contains(session.block?.course?.name, moduleFilters.course);

  const matchesChallengeFilters = (challenge: any) =>
    contains(`${challenge.student?.names ?? ''} ${challenge.student?.lastNames ?? ''}`, moduleFilters.name) &&
    contains(challenge.student?.email, moduleFilters.email) &&
    contains(challenge.content?.course?.name, moduleFilters.course);

  const filteredPending = pending.filter(matchesSessionFilters);
  const filteredConfirmed = upcoming.filter(matchesSessionFilters);
  const filteredCompleted = completed.filter(matchesSessionFilters);
  const filteredPendingChallenges = challenges.filter(
    c => c.status !== 'reviewed' && matchesChallengeFilters(c)
  );
  const filteredGradedChallenges = challenges.filter(
    c => c.status === 'reviewed' && matchesChallengeFilters(c)
  );
  const courseOptions = Array.from(new Set([
    ...pending.map(s => s.block?.course?.name).filter(Boolean),
    ...upcoming.map(s => s.block?.course?.name).filter(Boolean),
    ...completed.map(s => s.block?.course?.name).filter(Boolean),
    ...challenges.map(c => c.content?.course?.name).filter(Boolean),
  ] as string[])).sort((a, b) => a.localeCompare(b, 'es'));
  const pendingTotalPages = Math.max(1, Math.ceil(filteredPending.length / TUTORING_PAGE_SIZE));
  const confirmedTotalPages = Math.max(1, Math.ceil(filteredConfirmed.length / TUTORING_PAGE_SIZE));
  const completedTotalPages = Math.max(1, Math.ceil(filteredCompleted.length / TUTORING_PAGE_SIZE));
  const paginatedPending = filteredPending.slice(
    (pendingPage - 1) * TUTORING_PAGE_SIZE,
    pendingPage * TUTORING_PAGE_SIZE
  );
  const paginatedConfirmed = filteredConfirmed.slice(
    (confirmedPage - 1) * TUTORING_PAGE_SIZE,
    confirmedPage * TUTORING_PAGE_SIZE
  );
  const paginatedCompleted = filteredCompleted.slice(
    (completedPage - 1) * TUTORING_PAGE_SIZE,
    completedPage * TUTORING_PAGE_SIZE
  );
  const pendingChallengesTotalPages = Math.max(1, Math.ceil(filteredPendingChallenges.length / TUTORING_PAGE_SIZE));
  const gradedChallengesTotalPages = Math.max(1, Math.ceil(filteredGradedChallenges.length / TUTORING_PAGE_SIZE));
  const paginatedPendingChallenges = filteredPendingChallenges.slice(
    (pendingChallengesPage - 1) * TUTORING_PAGE_SIZE,
    pendingChallengesPage * TUTORING_PAGE_SIZE
  );
  const paginatedGradedChallenges = filteredGradedChallenges.slice(
    (gradedChallengesPage - 1) * TUTORING_PAGE_SIZE,
    gradedChallengesPage * TUTORING_PAGE_SIZE
  );

  useEffect(() => {
    if (pendingPage > pendingTotalPages) setPendingPage(1);
  }, [pendingPage, pendingTotalPages]);

  useEffect(() => {
    if (confirmedPage > confirmedTotalPages) setConfirmedPage(1);
  }, [confirmedPage, confirmedTotalPages]);

  useEffect(() => {
    if (completedPage > completedTotalPages) setCompletedPage(1);
  }, [completedPage, completedTotalPages]);

  useEffect(() => {
    if (pendingChallengesPage > pendingChallengesTotalPages) setPendingChallengesPage(1);
  }, [pendingChallengesPage, pendingChallengesTotalPages]);

  useEffect(() => {
    if (gradedChallengesPage > gradedChallengesTotalPages) setGradedChallengesPage(1);
  }, [gradedChallengesPage, gradedChallengesTotalPages]);

  const PaginationControls = ({
    currentPage,
    totalPages,
    totalItems,
    setPage,
    label = 'tutorías',
  }: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    setPage: (page: number) => void;
    label?: string;
  }) => (
    totalPages > 1 ? (
      <div className="px-6 py-4 bg-slate-900/40 border border-slate-700/50 rounded-lg flex items-center justify-between">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Mostrando {(currentPage - 1) * TUTORING_PAGE_SIZE + 1}-
          {Math.min(currentPage * TUTORING_PAGE_SIZE, totalItems)} de {totalItems} {label}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              currentPage === 1
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
          >
            ← Anterior
          </button>
          <div className="text-xs font-bold text-slate-300">
            {currentPage} / {totalPages}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
              currentPage === totalPages
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
          >
            Siguiente →
          </button>
        </div>
      </div>
    ) : null
  );

  const handleDownloadReport = async () => {
    try {
      const response = await api.downloadTutorTutoringReport(reportType);
      const disposition = response.headers?.['content-disposition'] as string | undefined;
      const matched = disposition?.match(/filename="?([^"]+)"?/i);
      const filename = matched?.[1] || `reporte_${reportType}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando reporte', error);
      window.alert('No se pudo descargar el reporte. Intenta nuevamente.');
    }
  };

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
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Dashboard</h1>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">Resumen de tu actividad como tutor</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as 'tutorias' | 'retos')}
                    className="bg-slate-900 border border-slate-600 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-md px-3 py-2"
                  >
                    <option value="tutorias">Tutorias</option>
                    <option value="retos">Retos</option>
                  </select>
                  <button
                    onClick={handleDownloadReport}
                    className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-md transition-colors"
                  >
                    Descargar reporte
                  </button>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {[
                { label: 'Pendientes de confirmar', value: pending.length, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', tab: 'pending' },
                { label: 'Tutorías confirmadas', value: upcoming.length, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', tab: 'confirmed' },
                { label: 'Pendientes de calificar', value: pendingGrade.length, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', tab: 'completed' },
                { label: 'Retos por revisar', value: pendingChallenges.length, icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', tab: 'challenge-pending' },
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
                    <a href="/tutor?tab=confirmed" className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest">Ver todas →</a>
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
                    <a href="/tutor?tab=challenge-pending" className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest">Ver todos →</a>
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

            </div>
          </div>
        )}

        {/* ── TABS ── */}
        {activeTab !== 'dashboard' && activeTab !== 'calendar' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                  {activeTab === 'pending' && 'Tutorías Pendientes'}
                  {activeTab === 'confirmed' && 'Tutorías Confirmadas'}
                  {activeTab === 'completed' && 'Tutorías Realizadas'}
                  {activeTab === 'students' && 'Mis Estudiantes'}
                  {activeTab === 'challenge-pending' && 'Retos por Revisar'}
                  {activeTab === 'challenge-graded' && 'Retos Calificados'}
                </h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                  {activeTab === 'pending' && 'Confirma o rechaza las nuevas solicitudes de tutoría'}
                  {activeTab === 'confirmed' && 'Sesiones programadas para los próximos días'}
                  {activeTab === 'completed' && 'Historial de sesiones ejecutadas y calificaciones'}
                  {activeTab === 'students' && 'Listado oficial de estudiantes bajo tu tutoría'}
                  {activeTab === 'challenge-pending' && 'Valida los retos entregados por tus estudiantes'}
                  {activeTab === 'challenge-graded' && 'Retos ya calificados y revisados'}
                </p>
              </div>
            </div>

            {activeTab !== 'students' && (
              <div className="bg-slate-800 border border-slate-700/50 rounded-lg p-4">
                <TutorModuleFilters filters={moduleFilters} courseOptions={courseOptions} onChange={setModuleFilters} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          filteredPending.length > 0 ? (
            <div className="space-y-4">
              <TutoringSessionsTable sessions={paginatedPending} onRefresh={fetchSessions} />
              <PaginationControls
                currentPage={pendingPage}
                totalPages={pendingTotalPages}
                totalItems={filteredPending.length}
                setPage={setPendingPage}
              />
            </div>
          ) : <EmptyState message="No hay tutorías pendientes" />
        )}

        {activeTab === 'confirmed' && (
          filteredConfirmed.length > 0 ? (
            <div className="space-y-4">
              <TutoringSessionsTable sessions={paginatedConfirmed} onRefresh={fetchSessions} />
              <PaginationControls
                currentPage={confirmedPage}
                totalPages={confirmedTotalPages}
                totalItems={filteredConfirmed.length}
                setPage={setConfirmedPage}
              />
            </div>
          ) : <EmptyState message="No hay tutorías confirmadas" />
        )}

        {activeTab === 'completed' && (
          filteredCompleted.length > 0 ? (
            <div className="space-y-4">
              <TutoringSessionsTable sessions={paginatedCompleted} onRefresh={fetchSessions} showGradeInActions />
              <PaginationControls
                currentPage={completedPage}
                totalPages={completedTotalPages}
                totalItems={filteredCompleted.length}
                setPage={setCompletedPage}
              />
            </div>
          ) : <EmptyState message="No hay tutorías completadas" />
        )}

        {activeTab === 'students' && <StudentsTab students={students} />}

        {activeTab === 'challenge-pending' && (
          filteredPendingChallenges.length > 0
            ? (
              <div className="space-y-4">
                <ChallengesTab challenges={paginatedPendingChallenges} onRefresh={fetchAll} />
                <PaginationControls
                  currentPage={pendingChallengesPage}
                  totalPages={pendingChallengesTotalPages}
                  totalItems={filteredPendingChallenges.length}
                  setPage={setPendingChallengesPage}
                  label="retos"
                />
              </div>
            )
            : <EmptyState message="No hay retos pendientes" />
        )}

        {activeTab === 'challenge-graded' && (
          filteredGradedChallenges.length > 0
            ? (
              <div className="space-y-4">
                <ChallengesTab challenges={paginatedGradedChallenges} onRefresh={fetchAll} />
                <PaginationControls
                  currentPage={gradedChallengesPage}
                  totalPages={gradedChallengesTotalPages}
                  totalItems={filteredGradedChallenges.length}
                  setPage={setGradedChallengesPage}
                  label="retos"
                />
              </div>
            )
            : <EmptyState message="No hay retos calificados" />
        )}

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
