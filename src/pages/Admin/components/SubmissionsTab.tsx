import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import Modal from '../../../components/Modal';
import { useDialog } from '../../../hooks/useDialog';
import { ConfirmDialog } from '../../../components/ConfirmDialog';

interface Course {
  id: string;
  name: string;
  slug: string;
}

interface Content {
  id: string;
  title: string;
  topicId: string;
}

interface Submission {
  id: string;
  userId: string;
  contentId: string;
  gitUrl: string;
  comment: string | null;
  submittedAt: string;
  isLate: boolean;
  status: 'submitted' | 'late' | 'reviewed';
  grade: number | null;
  observations: string | null;
  user?: {
    id: string;
    names: string;
    lastNames: string;
    email: string;
  };
}

const INPUT_CLS = 'w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500';
const BTN_PRIMARY = 'px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-medium rounded-lg transition-all';

export function SubmissionsTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [challenges, setChallenges] = useState<Content[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviewForm, setReviewForm] = useState({ grade: 0, observations: '' });
  const [isSaving, setIsSaving] = useState(false);

  const { dialog, close: closeDialog, showAlert } = useDialog();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await api.getAdminCourses();
      if (res.success) setCourses(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCourseChange = async (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedChallengeId('');
    setSubmissions([]);
    if (!courseId) {
      setChallenges([]);
      return;
    }

    try {
      const res = await api.getCourseTopics(courseId);
      if (res.success) {
        const allContents = await Promise.all(
          res.data.map((t: any) => api.getTopicContents(t.id))
        );
        const allChallenges = allContents
          .flatMap(r => r.success ? r.data : [])
          .filter((c: any) => c.type === 'challenge');
        setChallenges(allChallenges);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChallengeChange = async (challengeId: string) => {
    setSelectedChallengeId(challengeId);
    if (!challengeId) {
      setSubmissions([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.getSubmissionsByContent(challengeId);
      if (res.success) setSubmissions(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const openReviewModal = (sub: Submission) => {
    setSelectedSubmission(sub);
    setReviewForm({
      grade: sub.grade || 0,
      observations: sub.observations || ''
    });
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setIsSaving(true);
    try {
      const res = await api.reviewSubmission(selectedSubmission.id, {
        grade: reviewForm.grade,
        observations: reviewForm.observations
      });
      if (res.success) {
        setIsReviewModalOpen(false);
        handleChallengeChange(selectedChallengeId); // Refresh list
        showAlert('Calificación registrada correctamente.', 'Éxito');
      }
    } catch (e: any) {
      showAlert(e.response?.data?.message || e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Seleccionar Curso</label>
          <select
            className={INPUT_CLS}
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e.target.value)}
          >
            <option value="">-- Elige un curso --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Seleccionar Reto</label>
          <select
            className={INPUT_CLS}
            disabled={!selectedCourseId}
            value={selectedChallengeId}
            onChange={(e) => handleChallengeChange(e.target.value)}
          >
            <option value="">-- Elige un reto --</option>
            {challenges.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : selectedChallengeId && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-700/50 text-slate-300 font-medium uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Estudiante</th>
                  <th className="px-6 py-4">Fecha de Entrega</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-center">Nota</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 italic">
                      No hay entregas para este reto aún
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{sub.user?.names} {sub.user?.lastNames}</span>
                          <span className="text-xs text-slate-500">{sub.user?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(sub.submittedAt).toLocaleString('es')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          sub.status === 'reviewed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          sub.status === 'late' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                          'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                          {sub.status === 'reviewed' ? 'Revisado' : sub.status === 'late' ? 'Tardío' : 'Entregado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {sub.grade !== null ? (
                          <span className="text-lg font-bold text-red-400">{sub.grade}</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openReviewModal(sub)}
                          className="text-red-400 hover:text-red-300 font-medium transition-colors"
                        >
                          {sub.status === 'reviewed' ? 'Editar Nota' : 'Calificar'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Calificar Entrega"
      >
        {selectedSubmission && (
          <form onSubmit={handleSaveReview} className="space-y-5">
            <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">Detalles de la Entrega</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Repositorio Git</p>
                  <a href={selectedSubmission.gitUrl} target="_blank" rel="noopener noreferrer" 
                    className="text-blue-400 hover:text-blue-300 text-sm break-all font-medium">
                    {selectedSubmission.gitUrl}
                  </a>
                </div>
                {selectedSubmission.comment && (
                  <div>
                    <p className="text-xs text-slate-500">Comentario del estudiante</p>
                    <p className="text-sm text-slate-300 italic">"{selectedSubmission.comment}"</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Calificación (0-10) *</label>
              <input
                required
                type="number"
                step="0.1"
                min="0"
                max="10"
                className={INPUT_CLS}
                value={reviewForm.grade}
                onChange={e => setReviewForm(f => ({ ...f, grade: Number(e.target.value) }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Observaciones / Feedback</label>
              <textarea
                rows={4}
                className={INPUT_CLS}
                value={reviewForm.observations}
                onChange={e => setReviewForm(f => ({ ...f, observations: e.target.value }))}
                placeholder="Escribe aquí tus comentarios sobre el reto..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className={`flex-1 ${BTN_PRIMARY} py-3 disabled:opacity-50`}
              >
                {isSaving ? 'Guardando...' : 'Registrar Calificación'}
              </button>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        danger={dialog.danger}
        onConfirm={dialog.onConfirm}
        onCancel={closeDialog}
      />
    </div>
  );
}
