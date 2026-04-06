import type { Badge } from '../types/index';

export interface StudentBadgeDisplay extends Badge {
  state: 'locked' | 'available' | 'earned';
  awardedAt?: string;
}

export function StudentBadges({ badges }: { badges: StudentBadgeDisplay[] }) {
  const earned = badges.filter(b => b.state === 'earned');

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Insignias Obtenidas</p>
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
          {earned.length} / {badges.length}
        </span>
      </div>
      <div className="p-4">
        {earned.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-6 font-bold uppercase tracking-widest">Sin insignias aún</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {earned.map(b => (
              <div key={b.id} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-2 border-yellow-500/30 flex items-center justify-center overflow-hidden mb-2 relative shadow-lg shadow-yellow-900/10 group-hover:scale-110 transition-transform duration-300">
                  {b.imageUrl
                    ? <img src={b.imageUrl} alt={b.name} className="w-full h-full object-cover" />
                    : <span className="text-3xl text-yellow-500/50">🏆</span>
                  }
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-800 flex items-center justify-center shadow-md">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                  </div>
                </div>
                <p className="text-[10px] font-black text-white uppercase tracking-tighter line-clamp-1 leading-none mb-1 group-hover:text-yellow-400 transition-colors">{b.name}</p>
                {b.awardedAt && (
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/50 px-2 py-0.5 rounded-full border border-slate-700/50">
                    {new Date(b.awardedAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
