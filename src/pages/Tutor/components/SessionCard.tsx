import { useState, useEffect } from 'react';
import type { TutoringSession } from '../types';
import { api } from '../../../services/api';
import { useDialog } from '../../../hooks/useDialog';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import DateTimePicker from '../../../components/DateTimePicker';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  requested:   { label: 'Pendiente',   color: 'yellow' },
  confirmed:   { label: 'Confirmada',  color: 'blue' },
  rescheduled: { label: 'Reagendada',  color: 'orange' },
  executed:    { label: 'Ejecutada',   color: 'green' },
  cancelled:   { label: 'Cancelada',   color: 'red' },
};

const INPUT = 'w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500';

interface SessionCardProps {
  session: TutoringSession;
  onRefresh: () => void;
  onUpdate?: (updated: TutoringSession) => void;
}

export function SessionCard({ session, onRefresh, onUpdate }: SessionCardProps) {
  const [modal, setModal] = useState<'confirm' | 'reschedule' | 'cancel' | 'execute' | null>(null);
  const [disabledSlots, setDisabledSlots] = useState<string[]>([]);

  useEffect(() => {
    if (modal === 'confirm' || modal === 'reschedule') {
      const fetchAvailability = async () => {
        try {
          const response = await (api as any).getTutoringAvailability();
          if (response.success && response.data?.fullSlots) {
            setDisabledSlots(response.data.fullSlots);
          }
        } catch (err) {
          console.error('Error fetching availability:', err);
        }
      };
      fetchAvailability();
    }
  }, [modal]);
  const cfg = STATUS_LABELS[session.status] || STATUS_LABELS.requested;

  const handleSuccess = (updated?: TutoringSession) => {
    setModal(null);
    if (updated && onUpdate) {
      onUpdate(updated);
    } else {
      onRefresh();
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {session.student ? `${session.student.names[0]}${session.student.lastNames[0]}` : '?'}
          </div>
          <div>
            <p className="text-white font-semibold">
              {session.student ? `${session.student.names} ${session.student.lastNames}` : 'Sin asignar'}
            </p>
            <p className="text-xs text-slate-400">{session.block.course.name} • {session.block.name}</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 text-xs rounded-full bg-${cfg.color}-500/20 text-${cfg.color}-400 shrink-0`}>
          {cfg.label}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-1 text-sm text-slate-400 mb-4">
        <p>Bloque: <span className="text-slate-300">{session.block.name}</span></p>
        <p>Nota mínima: <span className="text-slate-300">{session.block.minPassGrade}/10</span></p>
        {session.scheduledAt && <p>Fecha: <span className="text-slate-300">{new Date(session.scheduledAt).toLocaleString('es')}</span></p>}
        {session.meetingLink && (
          <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 block truncate">
            {session.meetingLink}
          </a>
        )}
        {session.attemptNumber > 1 && <p className="text-orange-400">Intento #{session.attemptNumber}</p>}
      </div>

      {/* Results */}
      {session.status === 'executed' && session.grade !== undefined && session.grade !== null && (
        <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-slate-300">Calificación:</span>
            <span className={`text-xl font-bold ${session.grade >= session.block.minPassGrade ? 'text-green-400' : 'text-red-400'}`}>
              {session.grade}/10
            </span>
          </div>
          <p className={`text-xs font-semibold ${session.grade >= session.block.minPassGrade ? 'text-green-400' : 'text-red-400'}`}>
            {session.grade >= session.block.minPassGrade ? '✓ Aprobado' : '✗ No aprobado'}
          </p>
          {session.observations && <p className="text-xs text-slate-400 mt-1">{session.observations}</p>}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {session.status === 'requested' && (
          <>
            <button onClick={() => setModal('confirm')} className="flex-1 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">Confirmar</button>
            <button onClick={() => setModal('reschedule')} className="flex-1 py-2 text-sm bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors">Reagendar</button>
            <button onClick={() => setModal('cancel')} className="py-2 px-3 text-sm bg-slate-700 hover:bg-slate-600 text-red-400 rounded-lg transition-colors">Cancelar</button>
          </>
        )}
        {(session.status === 'confirmed' || session.status === 'rescheduled') && (
          <>
            <button onClick={() => setModal('execute')} className="flex-1 py-2 text-sm bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors">Registrar resultados</button>
            <button onClick={() => setModal('reschedule')} className="py-2 px-3 text-sm bg-slate-700 hover:bg-slate-600 text-orange-400 rounded-lg transition-colors">Reagendar</button>
            <button onClick={() => setModal('cancel')} className="py-2 px-3 text-sm bg-slate-700 hover:bg-slate-600 text-red-400 rounded-lg transition-colors">Cancelar</button>
          </>
        )}
      </div>

      {/* Modals */}
      {modal === 'confirm' && <ConfirmModal session={session} onClose={() => setModal(null)} onSuccess={handleSuccess} disabledSlots={disabledSlots} />}
      {modal === 'reschedule' && <RescheduleModal session={session} onClose={() => setModal(null)} onSuccess={handleSuccess} disabledSlots={disabledSlots} />}
      {modal === 'cancel' && <CancelModal session={session} onClose={() => setModal(null)} onSuccess={handleSuccess} />}
      {modal === 'execute' && <ExecuteModal session={session} onClose={() => setModal(null)} onSuccess={handleSuccess} />}
    </div>
  );
}

// ── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ session, onClose, onSuccess, disabledSlots }: { session: TutoringSession; onClose: () => void; onSuccess: (u?: TutoringSession) => void; disabledSlots: string[] }) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [saving, setSaving] = useState(false);
  const { dialog, showAlert, close: closeDialog } = useDialog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { scheduledAt: `${scheduledAt}:00.000Z`, meetingLink: meetingLink || undefined };
      const res = await api.confirmTutoringSession(session.id, payload);
      onSuccess(res.data);
    } catch (e: any) { showAlert(e.response?.data?.message || e.message); }
    finally { setSaving(false); }
  };

  return (
    <ModalWrapper title="Confirmar Tutoría" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <DateTimePicker 
            label="Fecha y hora programada"
            value={scheduledAt}
            onChange={setScheduledAt}
            disabledSlots={disabledSlots}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Link de reunión (Zoom/Teams)</label>
          <input type="url" className={INPUT} value={meetingLink} onChange={e => setMeetingLink(e.target.value)} placeholder="https://zoom.us/j/..." />
        </div>
        <ModalActions saving={saving} label="Confirmar" onClose={onClose} />
      </form>
      <ConfirmDialog isOpen={dialog.isOpen} title={dialog.title} message={dialog.message} confirmLabel={dialog.confirmLabel} onConfirm={dialog.onConfirm} onCancel={closeDialog} />
    </ModalWrapper>
  );
}

// ── Reschedule Modal ─────────────────────────────────────────────────────────
function RescheduleModal({ session, onClose, onSuccess, disabledSlots }: { session: TutoringSession; onClose: () => void; onSuccess: (u?: TutoringSession) => void; disabledSlots: string[] }) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [meetingLink, setMeetingLink] = useState(session.meetingLink || '');
  const [saving, setSaving] = useState(false);
  const { dialog, showAlert, close: closeDialog } = useDialog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { scheduledAt: `${scheduledAt}:00.000Z`, meetingLink: meetingLink || undefined };
      const res = await api.rescheduleTutoringSession(session.id, payload);
      onSuccess(res.data);
    } catch (e: any) { showAlert(e.response?.data?.message || e.message); }
    finally { setSaving(false); }
  };

  return (
    <ModalWrapper title="Reagendar Tutoría" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <DateTimePicker 
            label="Nueva fecha y hora"
            value={scheduledAt}
            onChange={setScheduledAt}
            disabledSlots={disabledSlots}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Link de reunión</label>
          <input type="url" className={INPUT} value={meetingLink} onChange={e => setMeetingLink(e.target.value)} placeholder="https://zoom.us/j/..." />
        </div>
        <ModalActions saving={saving} label="Reagendar" onClose={onClose} />
      </form>
      <ConfirmDialog isOpen={dialog.isOpen} title={dialog.title} message={dialog.message} confirmLabel={dialog.confirmLabel} onConfirm={dialog.onConfirm} onCancel={closeDialog} />
    </ModalWrapper>
  );
}

// ── Cancel Modal ─────────────────────────────────────────────────────────────
function CancelModal({ session, onClose, onSuccess }: { session: TutoringSession; onClose: () => void; onSuccess: (u?: TutoringSession) => void }) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const { dialog, showAlert, close: closeDialog } = useDialog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.cancelTutoringSession(session.id, { reason });
      onSuccess(res.data);
    } catch (e: any) { showAlert(e.response?.data?.message || e.message); }
    finally { setSaving(false); }
  };

  return (
    <ModalWrapper title="Cancelar Tutoría" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Motivo de cancelación</label>
          <textarea rows={3} className={INPUT} value={reason} onChange={e => setReason(e.target.value)} placeholder="Explica el motivo..." />
        </div>
        <ModalActions saving={saving} label="Cancelar tutoría" onClose={onClose} danger />
      </form>
      <ConfirmDialog isOpen={dialog.isOpen} title={dialog.title} message={dialog.message} confirmLabel={dialog.confirmLabel} onConfirm={dialog.onConfirm} onCancel={closeDialog} />
    </ModalWrapper>
  );
}

// ── Execute Modal ────────────────────────────────────────────────────────────
function ExecuteModal({ session, onClose, onSuccess }: { session: TutoringSession; onClose: () => void; onSuccess: (u?: TutoringSession) => void }) {
  const [grade, setGrade] = useState(session.block.minPassGrade);
  const [observations, setObservations] = useState('');
  const [recordingLink, setRecordingLink] = useState('');
  const [saving, setSaving] = useState(false);
  const { dialog, showAlert, close: closeDialog } = useDialog();
  const approved = grade >= session.block.minPassGrade;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.executeTutoringSession(session.id, { grade, observations: observations || undefined, recordingLink: recordingLink || undefined });
      onSuccess(res.data);
    } catch (e: any) { showAlert(e.response?.data?.message || e.message); }
    finally { setSaving(false); }
  };

  return (
    <ModalWrapper title="Registrar Resultados" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">Nota: <span className="text-white font-bold">{grade}/10</span></label>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${approved ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {approved ? 'Aprobado' : 'No aprobado'} (mín. {session.block.minPassGrade})
            </span>
          </div>
          <input type="range" min={0} max={10} step={0.5} value={grade}
            onChange={e => setGrade(parseFloat(e.target.value))}
            className="w-full accent-red-500" />
          <div className="flex justify-between text-xs text-slate-500 mt-1"><span>0</span><span>10</span></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Observaciones</label>
          <textarea rows={3} className={INPUT} value={observations} onChange={e => setObservations(e.target.value)} placeholder="Retroalimentación para el estudiante..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Link de grabación</label>
          <input type="url" className={INPUT} value={recordingLink} onChange={e => setRecordingLink(e.target.value)} placeholder="https://zoom.us/rec/..." />
        </div>
        <ModalActions saving={saving} label="Guardar resultados" onClose={onClose} />
      </form>
      <ConfirmDialog isOpen={dialog.isOpen} title={dialog.title} message={dialog.message} confirmLabel={dialog.confirmLabel} onConfirm={dialog.onConfirm} onCancel={closeDialog} />
    </ModalWrapper>
  );
}

// ── Shared Modal Components ──────────────────────────────────────────────────
function ModalWrapper({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ saving, label, onClose, danger }: { saving: boolean; label: string; onClose: () => void; danger?: boolean }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="submit" disabled={saving}
        className={`flex-1 py-2.5 font-semibold rounded-lg transition-all disabled:opacity-50 ${danger ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white'}`}>
        {saving ? 'Guardando...' : label}
      </button>
      <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
        Cancelar
      </button>
    </div>
  );
}
