import { useNavigate } from 'react-router-dom';
import { useStudentData } from './hooks/useStudentData';
import { StudentBadges } from './components';
import Footer from '../../components/Footer';

export default function Student() {
  const navigate = useNavigate();
  const { userName, courses, badges, upcomingTutorings, tutorings, isLoading, overallPct } = useStudentData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Últimas observaciones de tutorías ejecutadas
  const lastObservations = tutorings
    .filter((t: any) => t.status === 'executed' && t.observations)
    .sort((a: any, b: any) => new Date(b.executed_at || b.executedAt || 0).getTime() - new Date(a.executed_at || a.executedAt || 0).getTime())
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 border border-slate-700/50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full mb-4">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span className="text-red-400 text-sm font-black uppercase tracking-widest">Bienvenido, {userName || 'Estudiante'}</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            Continúa tu camino hacia el{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">éxito profesional</span>
          </h1>
          <p className="text-slate-400 mb-6">
            Has completado el <span className="text-red-400 font-black">{overallPct}%</span> de tu ruta de aprendizaje.
          </p>
          <div className="flex gap-3 flex-wrap">
            {courses[0] && (
              <button onClick={() => navigate(`/course/${courses[0].slug || courses[0].id}`)}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all">
                Continuar Aprendiendo
              </button>
            )}
            <button onClick={() => navigate('/meetings')}
              className="px-6 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-slate-600">
              Ver Tutorías
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Cursos Asignados', value: courses.length, color: 'blue', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
          { label: 'Progreso General', value: `${overallPct}%`, color: 'purple', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
          { label: 'Insignias', value: badges.filter((b: any) => b.state === 'earned').length, color: 'yellow', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
          { label: 'Tutorías Próximas', value: upcomingTutorings.length, color: 'red', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        ].map(s => (
          <div key={s.label} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{s.label}</span>
              <div className={`w-8 h-8 bg-${s.color}-500/20 rounded-lg flex items-center justify-center`}>
                <svg className={`w-4 h-4 text-${s.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-black text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── 3-col grid: Tutorías + Observaciones + Insignias ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Próximas tutorías */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próximas Tutorías</p>
            <button onClick={() => navigate('/meetings')} className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors">Ver todas →</button>
          </div>
          <div className="p-4 space-y-3">
            {upcomingTutorings.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6 font-bold uppercase tracking-widest">Sin tutorías próximas</p>
            ) : upcomingTutorings.slice(0, 3).map((t: any) => (
              <div key={t.id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-700/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-white uppercase tracking-tighter truncate">{t.block?.name || 'Bloque'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{t.block?.course?.name}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${t.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {t.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                  </span>
                </div>
                {(t.scheduledAt || t.scheduled_at) && (
                  <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {new Date(t.scheduledAt || t.scheduled_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Últimas observaciones */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Últimas Observaciones</p>
          </div>
          <div className="p-4 space-y-3">
            {lastObservations.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6 font-bold uppercase tracking-widest">Sin observaciones aún</p>
            ) : lastObservations.map((t: any) => (
              <div key={t.id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-700/50">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-black text-white uppercase tracking-tighter truncate">{t.block?.name}</p>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ml-2 ${(t.grade ?? 0) >= 7 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {t.grade}/10
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 italic line-clamp-2">"{t.observations}"</p>
                {t.tutor && (
                  <p className="text-[9px] text-slate-600 mt-1">— {t.tutor.names} {t.tutor.lastNames}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Insignias recientes */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Insignias Obtenidas</p>
          </div>
          <div className="p-4">
            {badges.filter((b: any) => b.state === 'earned').length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6 font-bold uppercase tracking-widest">Sin insignias aún</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {badges.filter((b: any) => b.state === 'earned').slice(0, 6).map((b: any) => (
                  <div key={b.id} className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center overflow-hidden mb-1.5">
                      {b.imageUrl ? <img src={b.imageUrl} alt={b.name} className="w-full h-full object-cover" /> : <span className="text-2xl">🏆</span>}
                    </div>
                    <p className="text-[9px] font-black text-white uppercase tracking-tighter line-clamp-2 leading-tight">{b.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Cursos con progreso ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-white uppercase tracking-tighter">Mis Cursos</h2>
          <button onClick={() => navigate('/courses')} className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors">Ver todos →</button>
        </div>
        {courses.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Sin cursos asignados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course: any) => {
              const pct = course.progress?.pct ?? 0;
              return (
                <button key={course.id} onClick={() => navigate(`/course/${course.slug || course.id}`)}
                  className="bg-slate-800 rounded-xl border border-slate-700 hover:border-red-500/50 transition-all text-left overflow-hidden group">
                  {course.imageUrl && (
                    <div className="h-28 overflow-hidden">
                      <img src={course.imageUrl} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-sm font-black text-white uppercase tracking-tighter mb-1 group-hover:text-red-400 transition-colors">{course.name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 shrink-0">{Math.round(pct)}%</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Full badges section ── */}
      {badges.length > 0 && <StudentBadges badges={badges} />}

      <Footer />
    </div>
  );
}
