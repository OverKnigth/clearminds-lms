import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Footer from '../../components/Footer';
import { api } from '../../services/api';
import { useTutorData } from './hooks/useTutorData';
import { SessionCard, StudentsTab, ChallengesTab } from './components';
import type { TutorTab } from './types';

export default function Tutor() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = (queryParams.get('tab') as TutorTab) || 'pending';
  const { pending, upcoming, completed, students, challenges, stats, isLoading, fetchSessions, fetchAll } = useTutorData();
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

  return (
    <div className="min-h-screen bg-slate-900 pt-8">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Panel del Tutor</h1>
            <p className="text-slate-400">Gestiona a tus estudiantes y valida su aprendizaje</p>
          </div>
        </div>

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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Rating',      value: stats.rating > 0 ? stats.rating.toFixed(2) : '-', subtext: `(${stats.reviewsCount} reseñas)`, color: 'yellow', icon: '★' },
            { label: 'Pendientes',  value: pending.length,   color: 'yellow' },
            { label: 'Próximas',    value: upcoming.length,  color: 'blue' },
            { label: 'Completadas', value: completed.length, color: 'green' },
            { label: 'Estudiantes', value: students.length,  color: 'red' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800 rounded-xl p-5 border border-slate-700 relative overflow-hidden">
              <p className="text-slate-400 text-sm mb-1">{s.label}</p>
              <p className="text-3xl font-bold flex items-end gap-2 text-white">
                {s.icon && <span className="text-yellow-400 text-2xl">{s.icon}</span>}
                {s.value}
                {s.subtext && <span className="text-sm text-slate-400 mb-1">{s.subtext}</span>}
              </p>
            </div>
          ))}
        </div>

        {/* Content */}
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
