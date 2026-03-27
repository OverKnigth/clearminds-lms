import type { Badge } from '../types';

export function StudentBadges({ badges }: { badges: Badge[] }) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Mis Insignias</h3>
        <span className="text-red-400 text-sm">{badges.length} obtenidas</span>
      </div>
      {badges.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {badges.slice(0, 6).map(a => (
            <div key={a.id} className="p-3 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-center">
              <div className="text-3xl mb-1">{a.badge.imageUrl ? '🏅' : '🥇'}</div>
              <p className="text-xs text-white font-medium line-clamp-2">{a.badge.name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{new Date(a.awardedAt).toLocaleDateString('es')}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-sm text-center py-8">Aún no has obtenido insignias</p>
      )}
    </div>
  );
}
