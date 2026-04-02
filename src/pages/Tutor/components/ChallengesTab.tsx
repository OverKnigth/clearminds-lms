import { useState } from 'react';
import type { ChallengeSubmission } from '../types';
import { api } from '../../../services/api';
import { useDialog } from '../../../hooks/useDialog';
import { ConfirmDialog } from '../../../components/ConfirmDialog';

interface ChallengesTabProps {
  challenges: ChallengeSubmission[];
  onRefresh: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  submitted: { label: 'Pendiente',  color: 'yellow' },
  late:      { label: 'Tardío',     color: 'orange' },
  reviewed:  { label: 'Revisado',   color: 'green' },
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
    <>
      <div className="bg-slate-800 border border-slate-700/50 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retos Entregados</p>
            <p className="text-xs text-slate-500 mt-0.5">{challenges.length} entrega{challenges.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-700/30 border-b border-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">#</th>
                <th className="px-4 py-3 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Reto</th>
                <th className="px-4 py-3 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Estudiante</th>
                <th className="px-4 py-3 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Generación / Paralelo</th>
                <th className="px-4 py-3 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Curso</th>
                <th className="px-4 py-3 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                <th className="px-4 py-3 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest">Nota</th>
                <th className="px-4 py-3 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {challenges.map((c, idx) => {
                const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.submitted;
                return (
                  <tr key={c.id} className="hover:bg-slate-700/20 transition-colors">
                    {/* # */}
                    <td className="px-4 py-3 text-slate-500 font-bold">{idx + 1}</td>

                    {/* Reto */}
                    <td className="px-4 py-3">
                      <p className="font-black text-white uppercase tracking-tighter">{c.content.title}</p>
                      {c.isLate && (
                        <span className="text-[9px] font-black text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">Tardío</span>
                      )}
                    </td>

                    {/* Estudiante */}
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-200">{c.student.names} {c.student.lastNames}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{c.student.email}</p>
                    </td>

                    {/* Generación / Paralelo */}
                    <td className="px-4 py-3">
                      {c.group ? (
                        <>
                          <p className="font-bold text-slate-300">{c.group.name}</p>
                          {c.group.cohort && <p className="text-[10px] text-slate-500">{c.group.cohort}</p>}
                        </>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Curso */}
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-300 truncate max-w-[120px]">{c.content.course?.name ?? '—'}</p>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-${cfg.color}-500/20 text-${cfg.color}-400`}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* Nota */}
                    <td className="px-4 py-3 text-center">
                      {c.grade !== null ? (
                        <span className={`font-black text-sm ${c.grade >= 7 ? 'text-green-400' : 'text-red-400'}`}>
                          {c.grade}/10
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Acción */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setReviewing(c)}
                        title={c.status === 'reviewed' ? 'Ver / Editar calificación' : 'Revisar y calificar'}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                          c.status === 'reviewed'
                            ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                            : 'bg-red-600/20 hover:bg-red-600/40 text-red-400'
                        }`}
                      >
                        {c.status === 'reviewed' ? 'Ver' : 'Calificar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {reviewing && (
        <ReviewModal
          submission={reviewing}
          onClose={() => setReviewing(null)}
          onSuccess={() => { setReviewing(null); onRefresh(); }}
        />
      )}
    </>
  );
}

function ReviewModal({ submission, onClose, onSuccess }: {
  submission: ChallengeSubmission;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [grade, setGrade] = useState<number>(submission.grade ?? 7);
  const [observations, setObservations] = useState(submission.observations ?? '');
  const [saving, setSaving] = useState(false);
  const { dialog, showAlert, close: closeDialog } = useDialog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.reviewSubmission(submission.id, { grade, observations: observations || undefined });
      onSuccess();
    } catch (e: any) {
      showAlert(e.response?.data?.message || e.message);
    }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Calificar Reto</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-slate-700/50 rounded-lg space-y-1">
          <p className="text-white font-black text-sm uppercase tracking-tighter">{submission.content.title}</p>
          <p className="text-xs text-slate-400">{submission.student.names} {submission.student.lastNames}</p>
          <a href={submission.gitUrl} target="_blank" rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-xs block truncate">{submission.gitUrl}</a>
          {submission.comment && (
            <p className="text-xs text-slate-500 italic">"{submission.comment}"</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nota</label>
              <span className={`text-xl font-black ${grade >= 7 ? 'text-green-400' : 'text-red-400'}`}>{grade}/10</span>
            </div>
            <input type="range" min={0} max={10} step={0.5} value={grade}
              onChange={e => setGrade(parseFloat(e.target.value))} className="w-full accent-red-500" />
            <div className="flex justify-between text-[9px] text-slate-600 mt-1">
              <span>0</span><span>5</span><span>10</span>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Observaciones</label>
            <textarea rows={3}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              value={observations} onChange={e => setObservations(e.target.value)}
              placeholder="Retroalimentación para el estudiante..." />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-widest rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? 'Guardando...' : 'Guardar calificación'}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        onConfirm={dialog.onConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}
