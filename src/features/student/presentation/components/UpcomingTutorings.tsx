import { useNavigate } from 'react-router-dom';
import type { Tutoring } from '../types/index';

export function UpcomingTutorings({ tutorings }: { tutorings: Tutoring[] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Próximas Tutorías</h3>
        <button onClick={() => navigate('/meetings')} className="text-red-400 hover:text-red-300 text-sm">Ver todas</button>
      </div>
      {tutorings.length > 0 ? (
        <div className="space-y-3">
          {tutorings.slice(0, 2).map((t) => (
            <div key={t.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-white font-medium">{t.block?.name}</p>
                  <p className="text-sm text-slate-400">{t.block?.course?.name}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-full ${t.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {t.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                </span>
              </div>
              {t.scheduledAt && (
                <p className="text-xs text-slate-400 mt-1">{new Date(t.scheduledAt).toLocaleDateString('es')}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-sm text-center py-8">No tienes tutorías programadas</p>
      )}
    </div>
  );
}
