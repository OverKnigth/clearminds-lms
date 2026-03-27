import { useState } from 'react';
import type { ChallengeSubmission } from '../types';
import { api } from '../../../services/api';

interface ChallengesTabProps {
  challenges: ChallengeSubmission[];
  onRefresh: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  submitted: { label: 'Entregado',          color: 'blue' },
  late:      { label: 'Fuera de tiempo',    color: 'orange' },
  reviewed:  { label: 'Revisado',           color: 'green' },
};

export function ChallengesTab({ challenges, onRefresh }: ChallengesTabProps) {
  const [reviewing, setReviewing] = useState<ChallengeSubmission | null>(null);

  if (challenges.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-xl">
        <p className="text-slate-400">No hay retos entregados aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {challenges.map(c => {
        const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.submitted;
        return (
          <div key={c.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white font-semibold">{c.content.title}</p>
                <p className="text-xs text-slate-400">{c.content.course?.name}</p>
                <p className="text-sm text-slate-300 mt-1">{c.student.names} {c.student.lastNames}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {c.isLate && <span className="px-2 py-0.5 text-xs rounded-full bg-orange-500/20 text-orange-400">Tardío</span>}
                <span className={`px-2 py-0.5 text-xs rounded-full bg-${cfg.color}-500/20 text-${cfg.color}-400`}>{cfg.label}</span>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <a href={c.gitUrl} target="_blank" rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm truncate">{c.gitUrl}</a>
              </div>
              {c.comment && <p className="text-sm text-slate-400 italic">"{c.comment}"</p>}
              <p className="text-xs text-slate-500">Entregado: {new Date(c.submittedAt).toLocaleString('es')}</p>
            </div>

            {c.status === 'reviewed' && c.grade !== null && (
              <div className="p-3 bg-slate-700/50 rounded-lg mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Calificación:</span>
                  <span className="text-xl font-bold text-green-400">{c.grade}/10</span>
                </div>
                {c.observations && <p className="text-sm text-slate-400 mt-1">{c.observations}</p>}
              </div>
            )}

            {c.status !== 'reviewed' && (
              <button onClick={() => setReviewing(c)}
                className="w-full py-2 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors font-medium">
                Revisar y calificar
              </button>
            )}
          </div>
        );
      })}

      {reviewing && (
        <ReviewModal
          submission={reviewing}
          onClose={() => setReviewing(null)}
          onSuccess={() => { setReviewing(null); onRefresh(); }}
        />
      )}
    </div>
  );
}

function ReviewModal({ submission, onClose, onSuccess }: {
  submission: ChallengeSubmission;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [grade, setGrade] = useState<number>(7);
  const [observations, setObservations] = useState('');
  const [saving, setSaving] = useState(false);
  const INPUT = 'w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.reviewSubmission(submission.id, { grade, observations: observations || undefined });
      onSuccess();
    } catch (e: any) { alert(e.response?.data?.message || e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Revisar Reto</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
          <p className="text-white font-medium">{submission.content.title}</p>
          <p className="text-sm text-slate-400">{submission.student.names} {submission.student.lastNames}</p>
          <a href={submission.gitUrl} target="_blank" rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm mt-1 block truncate">{submission.gitUrl}</a>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">Nota: <span className="text-white font-bold">{grade}/10</span></label>
            </div>
            <input type="range" min={0} max={10} step={0.5} value={grade}
              onChange={e => setGrade(parseFloat(e.target.value))} className="w-full accent-red-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Observaciones</label>
            <textarea rows={3} className={INPUT} value={observations} onChange={e => setObservations(e.target.value)} placeholder="Retroalimentación..." />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar calificación'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
