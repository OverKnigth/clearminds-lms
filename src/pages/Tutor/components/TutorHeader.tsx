import type { TutorTab } from '../types';

interface TutorHeaderProps {
  activeTab: TutorTab;
  setActiveTab: (tab: TutorTab) => void;
  counts: { pending: number; upcoming: number; completed: number; students: number; challenges: number };
}

export function TutorHeader({ activeTab, setActiveTab, counts }: TutorHeaderProps) {
  const tabs: { id: TutorTab; label: string; count?: number }[] = [
    { id: 'pending',    label: 'Pendientes',   count: counts.pending },
    { id: 'upcoming',   label: 'Próximas',     count: counts.upcoming },
    { id: 'completed',  label: 'Completadas' },
    { id: 'students',   label: 'Estudiantes',  count: counts.students },
    { id: 'challenges', label: 'Retos',        count: counts.challenges },
  ];

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1">Panel del Tutor</h1>
        <p className="text-slate-400">Gestiona tutorías y valida el aprendizaje de tus estudiantes</p>
      </div>
      <div className="flex gap-1 border-b border-slate-700 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id ? 'text-red-400 border-b-2 border-red-400' : 'text-slate-400 hover:text-white'
            }`}>
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
