import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import Modal from '../../../components/Modal';
import { useDialog } from '../../../hooks/useDialog';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import DateTimePicker from '../../../components/DateTimePicker';
import { datetimeLocalToIsoUtc, toDatetimeLocalValue } from '../../../utils/datetimeLocal';

interface TutoringSession {
  id: string;
  status: 'requested' | 'confirmed' | 'rescheduled' | 'cancelled' | 'executed';
  requestedAt: string;
  scheduledAt: string | null;
  executedAt: string | null;
  meetingLink: string | null;
  recordingLink: string | null;
  grade: number | null;
  observations: string | null;
  attemptNumber: number;
  cancellationReason: string | null;
  tutorRating: number | null;
  tutorFeedback: string | null;
  block: { id: string; name: string; course: { name: string } };
  student: { id: string; names: string; last_names: string; email: string };
  tutor: { id: string; names: string; last_names: string } | null;
}

const INPUT_CLS = 'w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500';
const BTN_PRIMARY = 'px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-medium rounded-lg transition-all';

export function TutoringSessionsTab() {
  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const { dialog, showAlert, close: closeDialog } = useDialog();

  // Modals state
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; session: TutoringSession | null }>({ open: false, session: null });
  const [executeModal, setExecuteModal] = useState<{ open: boolean; session: TutoringSession | null }>({ open: false, session: null });
  const [cancelModal, setCancelModal] = useState<{ open: boolean; session: TutoringSession | null }>({ open: false, session: null });

  // Form states
  const [confirmForm, setConfirmForm] = useState({ scheduledAt: '', meetingLink: '' });
  const [executeForm, setExecuteForm] = useState({ grade: 0, observations: '', recordingLink: '' });
  const [cancelForm, setCancelForm] = useState({ reason: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [disabledSlots, setDisabledSlots] = useState<string[]>([]);

  useEffect(() => {
    loadSessions();
    fetchAvailability();
  }, []);

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

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const res = await api.getTutorSessions();
      if (res.success) setSessions(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmModal.session) return;
    setIsSaving(true);
    try {
      const payload = {
        ...confirmForm,
        scheduledAt: datetimeLocalToIsoUtc(confirmForm.scheduledAt)
      };
      const res = await api.confirmTutoringSession(confirmModal.session.id, payload);
      if (res.success) {
        setConfirmModal({ open: false, session: null });
        loadSessions();
      }
    } catch (e: any) {
      showAlert(e.response?.data?.message || e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executeModal.session) return;
    setIsSaving(true);
    try {
      const res = await api.executeTutoringSession(executeModal.session.id, executeForm);
      if (res.success) {
        setExecuteModal({ open: false, session: null });
        loadSessions();
      }
    } catch (e: any) {
      showAlert(e.response?.data?.message || e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModal.session) return;
    setIsSaving(true);
    try {
      const res = await api.cancelTutoringSession(cancelModal.session.id, cancelForm);
      if (res.success) {
        setCancelModal({ open: false, session: null });
        loadSessions();
      }
    } catch (e: any) {
      showAlert(e.response?.data?.message || e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSessions = sessions.filter(s => filter === 'all' || s.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6 bg-slate-800 border border-slate-700/50 rounded-lg px-6 py-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Sesiones de Tutoría</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Gestiona y supervisa todas las sesiones de tutoría</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'requested', 'confirmed', 'rescheduled', 'executed', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                filter === f ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {f === 'all' ? 'Todos' : 
               f === 'requested' ? 'Pendientes' : 
               f === 'confirmed' ? 'Confirmados' :
               f === 'rescheduled' ? 'Reagendados' :
               f === 'executed' ? 'Ejecutados' : 'Cancelados'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-700/50 text-slate-300 font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Estudiante / Curso</th>
                  <th className="px-6 py-4">Bloque</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Fecha Solicitud</th>
                  <th className="px-6 py-4">Programada</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500 italic">
                      No hay sesiones de tutoría que coincidan con el filtro
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{s.student.names} {s.student.last_names}</span>
                          <span className="text-xs text-slate-500">{s.block.course.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{s.block.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          s.status === 'executed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          s.status === 'confirmed' || s.status === 'rescheduled' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                          s.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          'bg-orange-500/10 text-orange-500 border-orange-500/20'
                        }`}>
                          {s.status === 'requested' ? 'Pendiente' : 
                           s.status === 'confirmed' ? 'Confirmada' :
                           s.status === 'rescheduled' ? 'Reagendada' :
                           s.status === 'executed' ? 'Ejecutada' : 'Cancelada'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {new Date(s.requestedAt).toLocaleString('es')}
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-xs">
                        {s.scheduledAt ? new Date(s.scheduledAt).toLocaleString('es') : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {(s.status === 'requested' || s.status === 'rescheduled' || s.status === 'confirmed') && (
                            <>
                              <button
                                onClick={() => {
                                  setConfirmModal({ open: true, session: s });
                                  setConfirmForm({
                                    scheduledAt: s.scheduledAt ? toDatetimeLocalValue(new Date(s.scheduledAt)) : '',
                                    meetingLink: s.meetingLink || ''
                                  });
                                }}
                                className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase"
                              >
                                {s.status === 'requested' ? 'Confirmar' : 'Reagendar'}
                              </button>
                              <button
                                onClick={() => {
                                  setExecuteModal({ open: true, session: s });
                                  setExecuteForm({ grade: 0, observations: '', recordingLink: '' });
                                }}
                                className="text-green-400 hover:text-green-300 text-xs font-bold uppercase"
                              >
                                Ejecutar
                              </button>
                              <button
                                onClick={() => {
                                  setCancelModal({ open: true, session: s });
                                  setCancelForm({ reason: '' });
                                }}
                                className="text-red-400 hover:text-red-300 text-xs font-bold uppercase"
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                          {s.status === 'executed' && (
                            <div className="flex flex-col items-end">
                              <span className="text-xs font-bold text-red-400">Nota: {s.grade}</span>
                              {s.tutorRating && (
                                <div className="flex gap-0.5 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-3 h-3 ${i < s.tutorRating! ? 'text-yellow-400' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm/Reschedule Modal */}
      <Modal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, session: null })}
        title={confirmModal.session?.status === 'requested' ? "Confirmar Tutoría" : "Reagendar Tutoría"}
      >
        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <DateTimePicker 
              label="Fecha y Hora *"
              value={confirmForm.scheduledAt}
              onChange={(val) => setConfirmForm(f => ({ ...f, scheduledAt: val }))}
              disabledSlots={disabledSlots}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Link de la Reunión (Zoom/Teams)</label>
            <input
              type="url"
              className={INPUT_CLS}
              placeholder="https://zoom.us/j/..."
              value={confirmForm.meetingLink}
              onChange={e => setConfirmForm(f => ({ ...f, meetingLink: e.target.value }))}
            />
          </div>
          <button type="submit" disabled={isSaving} className={`w-full ${BTN_PRIMARY} py-3 mt-4 disabled:opacity-50`}>
            {isSaving ? 'Guardando...' : 'Confirmar Programación'}
          </button>
        </form>
      </Modal>

      {/* Execute Modal */}
      <Modal
        isOpen={executeModal.open}
        onClose={() => setExecuteModal({ open: false, session: null })}
        title="Finalizar Tutoría y Calificar"
      >
        <form onSubmit={handleExecute} className="space-y-4">
          <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600 mb-4">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Bloque</p>
            <p className="text-white font-medium">{executeModal.session?.block.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nota (0-10) *</label>
            <input
              required
              type="number"
              step="0.1"
              min="0"
              max="10"
              className={INPUT_CLS}
              value={executeForm.grade}
              onChange={e => setExecuteForm(f => ({ ...f, grade: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Link de Grabación</label>
            <input
              type="url"
              className={INPUT_CLS}
              placeholder="Link de la grabación de la sesión"
              value={executeForm.recordingLink}
              onChange={e => setExecuteForm(f => ({ ...f, recordingLink: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Observaciones / Feedback</label>
            <textarea
              rows={4}
              className={INPUT_CLS}
              value={executeForm.observations}
              onChange={e => setExecuteForm(f => ({ ...f, observations: e.target.value }))}
              placeholder="Comentarios sobre el desempeño del estudiante..."
            />
          </div>
          <button type="submit" disabled={isSaving} className={`w-full ${BTN_PRIMARY} py-3 mt-4 disabled:opacity-50`}>
            {isSaving ? 'Guardando...' : 'Registrar Resultados'}
          </button>
        </form>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, session: null })}
        title="Cancelar Tutoría"
      >
        <form onSubmit={handleCancel} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Motivo de Cancelación *</label>
            <textarea
              required
              rows={4}
              className={INPUT_CLS}
              value={cancelForm.reason}
              onChange={e => setCancelForm(f => ({ ...f, reason: e.target.value }))}
              placeholder="Justifica la cancelación de la sesión..."
            />
          </div>
          <button type="submit" disabled={isSaving} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium disabled:opacity-50">
            {isSaving ? 'Cancelando...' : 'Confirmar Cancelación'}
          </button>
        </form>
      </Modal>
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
