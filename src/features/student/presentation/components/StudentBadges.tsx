import type { Badge } from '../types/index';

export interface StudentBadgeDisplay extends Badge {
  state: 'locked' | 'available' | 'earned';
  awardedAt?: string;
}

export function StudentBadges({ badges }: { badges: StudentBadgeDisplay[] }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Insignias y Reconocimientos</h3>
          <p className="text-xs text-slate-400">Completa los bloques académicos para desbloquear gráficos exclusivos</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-500 text-[10px] font-bold uppercase tracking-wider">
            {badges.filter(b => b.state === 'earned').length} de {badges.length}
          </span>
        </div>
      </div>

      {badges.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {badges.map(b => (
            <div key={b.id} className={`group relative flex flex-col items-center text-center transition-all duration-500 ${
              b.state === 'locked' ? 'opacity-30 grayscale' : 
              b.state === 'available' ? 'opacity-70 scale-95' : 'hover:scale-105'
            }`}>
              {/* Badge Graphic */}
              <div className="relative mb-3">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden border-2 transition-all duration-500 ${
                  b.state === 'earned' ? 'bg-gradient-to-tr from-yellow-500/10 to-red-600/20 border-yellow-500/50 shadow-lg shadow-red-900/40' : 
                  b.state === 'available' ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-800 border-slate-700'
                }`}>
                  {b.imageUrl ? (
                    <img src={b.imageUrl} alt={b.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl filter drop-shadow-md">🏆</span>
                  )}
                </div>
                
                {/* Status Indicator Overlay */}
                {b.state === 'locked' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-2xl">
                    <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                )}
                
                {b.state === 'earned' && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-800 flex items-center justify-center shadow-lg">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <h4 className="text-[10px] font-black text-white mb-0.5 line-clamp-2 leading-tight uppercase tracking-widest px-1">
                {b.name}
              </h4>
              <p className={`text-[9px] font-bold ${
                b.state === 'earned' ? 'text-green-400' : 
                b.state === 'available' ? 'text-amber-500' : 'text-slate-500'
              }`}>
                {b.state === 'earned' ? 'Obtenida' : b.state === 'available' ? 'Disponible por obtener' : 'Bloqueada'}
              </p>
              
              {b.awardedAt && (
                <p className="text-[8px] text-slate-500 mt-1 font-medium">{new Date(b.awardedAt).toLocaleDateString('es')}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center opacity-50 grayscale">
           <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mb-4">
             <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
           </div>
           <p className="text-slate-400 text-sm font-medium">No hay insignias para mostrar</p>
        </div>
      )}
    </div>
  );
}
