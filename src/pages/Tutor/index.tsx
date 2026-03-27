import { useState } from 'react';
import Footer from '../../components/Footer';
import { useTutorData } from './hooks/useTutorData';
import { TutorHeader, SessionCard, StudentsTab, ChallengesTab } from './components';
import type { TutorTab } from './types';

export default function Tutor() {
  const [activeTab, setActiveTab] = useState<TutorTab>('pending');
  const { pending, upcoming, completed, students, challenges, isLoading, fetchSessions, fetchAll } = useTutorData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-16 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <TutorHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          counts={{
            pending: pending.length,
            upcoming: upcoming.length,
            completed: completed.length,
            students: students.length,
            challenges: challenges.filter(c => c.status !== 'reviewed').length,
          }}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pendientes',  value: pending.length,   color: 'yellow' },
            { label: 'Próximas',    value: upcoming.length,  color: 'blue' },
            { label: 'Completadas', value: completed.length, color: 'green' },
            { label: 'Estudiantes', value: students.length,  color: 'red' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-white">{s.value}</p>
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
