import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import Footer from '../../components/Footer';

interface Tutoring {
  id: string;
  status: string;
  requested_at: string;
  scheduled_at?: string;
  executed_at?: string;
  meeting_link?: string;
  recording_link?: string;
  grade?: number;
  observations?: string;
  attempt_number: number;
  cancellation_reason?: string;
  tutor_rating?: number;
  tutor_feedback?: string;
  block: { id: string; name: string; course: { id: string; name: string } };
  tutor?: { id: string; names: string; lastNames: string; email: string };
}

interface Course { id: string; name: string; topics: { id: string; blockId: string | null; blockName: string | null }[] }

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  requested: { color: 'yellow', label: 'Pendiente' },
  confirmed: { color: 'blue', label: 'Confirmada' },
  executed: { color: 'green', label: 'Completada' },
  cancelled: { color: 'red', label: 'Cancelada' },
};

export default function Meetings() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tutorings, setTutorings] = useState<Tutoring[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [preselectedBlockId, setPreselectedBlockId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // Check if there's a preselected block in the navigation state
    if (location.state && (location.state as any).preselectedBlockId) {
      setPreselectedBlockId((location.state as any).preselectedBlockId);
      setShowModal(true);
    }
  }, [location]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tr, cr] = await Promise.allSettled([api.getStudentTutoring(), api.getStudentCourses()]);
      if (tr.status === 'fulfilled' && tr.value.success) setTutorings(tr.value.data);
      if (cr.status === 'fulfilled' && cr.value.success) setCourses(cr.value.data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const pending = tutorings.filter(t => t.status === 'requested');
  const confirmed = tutorings.filter(t => t.status === 'confirmed' || t.status === 'rescheduled');
  const completed = tutorings.filter(t => t.status === 'executed');

  if (isLoading) return (
    <div className="min-h-screen bg-slate-900 pt-16 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-3 transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </button>
            <h1 className="text-3xl font-bold text-white">Mis Tutorías</h1>
            <p className="text-slate-400">Gestiona tus sesiones de validación</p>
          </div>
          <button onClick={() => {
            setPreselectedBlockId(null);
            setShowModal(true);
          }}
            className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Solicitar Tutoría
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Pendientes', value: pending.length, color: 'yellow' },
            { label: 'Confirmadas', value: confirmed.length, color: 'blue' },
            { label: 'Completadas', value: completed.length, color: 'green' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Sections */}
        {[
          { title: 'Pendientes de confirmar', items: pending, color: 'yellow' },
          { title: 'Próximas', items: confirmed, color: 'blue', showJoin: true },
          { title: 'Completadas', items: completed, color: 'green', showResults: true },
        ].map(section => section.items.length > 0 && (
          <div key={section.title} className="mb-10">
            <h2 className="text-xl font-bold text-white mb-4">{section.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.items.map(t => (
                <TutoringCard
                  key={t.id}
                  tutoring={t}
                  showJoin={section.showJoin}
                  showResults={section.showResults}
                  onRated={loadData}
                />
              ))}
            </div>
          </div>
        ))}

        {tutorings.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-xl">
            <p className="text-slate-400 mb-2">No tienes tutorías aún</p>
            <p className="text-slate-500 text-sm">Completa los bloques de tus cursos para solicitar tutorías</p>
          </div>
        )}
      </div>

      {showModal && (
        <RequestModal 
          courses={courses} 
          initialBlockId={preselectedBlockId || ''} 
          onClose={() => setShowModal(false)} 
          onSuccess={loadData} 
        />
      )}
      <Footer />
    </div>
  );
}

function RequestModal({ courses, initialBlockId, onClose, onSuccess }: { courses: Course[]; initialBlockId?: string; onClose: () => void; onSuccess: () => void }) {
  const [blockId, setBlockId] = useState(initialBlockId || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialBlockId) setBlockId(initialBlockId);
  }, [initialBlockId]);

  // Collect all blocks from all courses
  const blocks = courses.flatMap(c =>
    c.topics?.filter(t => t.blockId).map(t => ({
      id: t.blockId!,
      name: t.blockName || t.blockId!,
      courseName: c.name,
    })) || []
  ).filter((b, i, arr) => arr.findIndex(x => x.id === b.id) === i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockId) return;
    setSubmitting(true);
    try {
      await api.requestTutoring(blockId);
      onSuccess();
      onClose();
    } catch (e: any) { alert(e.response?.data?.message || e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Solicitar Tutoría</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Bloque</label>
            <select required value={blockId} onChange={e => setBlockId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="">Selecciona un bloque</option>
              {blocks.map(b => (
                <option key={b.id} value={b.id}>{b.courseName} — {b.name}</option>
              ))}
            </select>
            {blocks.length === 0 && (
              <p className="text-xs text-slate-500 mt-1">No hay bloques disponibles. Asegúrate de tener cursos asignados con bloques.</p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting || !blockId}
              className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50">
              {submitting ? 'Enviando...' : 'Solicitar'}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Star Rating Component ────────────────────────────────────────────────────
function StarRating({ value, onChange, readonly }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`text-2xl transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
        >
          <span className={(hovered || value) >= star ? 'text-yellow-400' : 'text-slate-600'}>★</span>
        </button>
      ))}
    </div>
  );
}

// ── TutoringCard Component ───────────────────────────────────────────────────
function TutoringCard({
  tutoring,
  showJoin,
  showResults,
  onRated,
}: {
  tutoring: Tutoring;
  showJoin?: boolean;
  showResults?: boolean;
  onRated: () => void;
}) {
  const cfg = STATUS_CONFIG[tutoring.status] || STATUS_CONFIG.requested;
  const [showRateModal, setShowRateModal] = useState(false);

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white font-semibold">{tutoring.block.name}</p>
          <p className="text-sm text-slate-400">{tutoring.block.course.name}</p>
        </div>
        <span className={`px-2 py-0.5 text-xs rounded-full bg-${cfg.color}-500/20 text-${cfg.color}-400 shrink-0`}>
          {cfg.label}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-1 text-sm text-slate-400">
        {tutoring.tutor && (
          <p>Tutor: <span className="text-slate-300">{tutoring.tutor.names} {tutoring.tutor.lastNames}</span></p>
        )}
        {tutoring.scheduled_at && (
          <p>Fecha: <span className="text-slate-300">{new Date(tutoring.scheduled_at).toLocaleString('es')}</span></p>
        )}
        <p>Solicitada: {new Date(tutoring.requested_at).toLocaleDateString('es')}</p>
        {tutoring.attempt_number > 1 && (
          <p className="text-orange-400">Intento #{tutoring.attempt_number}</p>
        )}
        {tutoring.cancellation_reason && (
          <p className="text-red-400">Cancelada: {tutoring.cancellation_reason}</p>
        )}
      </div>

      {/* Results */}
      {showResults && tutoring.grade !== undefined && tutoring.grade !== null && (
        <div className="p-3 bg-slate-700/50 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-sm">Calificación:</span>
            <span className={`text-xl font-bold ${tutoring.grade >= 7 ? 'text-green-400' : 'text-red-400'}`}>
              {tutoring.grade}/10
            </span>
          </div>
          {tutoring.grade >= 7 ? (
            <p className="text-xs text-green-400 font-semibold">✓ Bloque aprobado</p>
          ) : (
            <p className="text-xs text-red-400 font-semibold">✗ No aprobado — puedes reagendar</p>
          )}
          {tutoring.observations && (
            <p className="text-sm text-slate-300 border-t border-slate-600 pt-2">{tutoring.observations}</p>
          )}
          {tutoring.recording_link && (
            <a href={tutoring.recording_link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Ver grabación
            </a>
          )}
        </div>
      )}

      {/* Tutor rating */}
      {showResults && (
        <div className="border-t border-slate-700 pt-3">
          {tutoring.tutor_rating ? (
            <div>
              <p className="text-xs text-slate-500 mb-1">Tu calificación al tutor:</p>
              <StarRating value={tutoring.tutor_rating} readonly />
              {tutoring.tutor_feedback && (
                <p className="text-xs text-slate-400 mt-1 italic">"{tutoring.tutor_feedback}"</p>
              )}
            </div>
          ) : tutoring.grade !== undefined && tutoring.grade !== null ? (
            <button
              onClick={() => setShowRateModal(true)}
              className="w-full py-2 text-sm text-yellow-400 hover:text-yellow-300 border border-yellow-500/30 hover:border-yellow-500/60 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>★</span> Calificar al tutor
            </button>
          ) : null}
        </div>
      )}

      {/* Join button */}
      {showJoin && tutoring.meeting_link && (
        <a href={tutoring.meeting_link} target="_blank" rel="noopener noreferrer"
          className="block text-center py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg transition-all text-sm">
          Unirse a la reunión
        </a>
      )}

      {showRateModal && (
        <RateTutorModal
          sessionId={tutoring.id}
          tutorName={tutoring.tutor ? `${tutoring.tutor.names} ${tutoring.tutor.lastNames}` : 'Tutor'}
          onClose={() => setShowRateModal(false)}
          onSuccess={() => { setShowRateModal(false); onRated(); }}
        />
      )}
    </div>
  );
}

// ── Rate Tutor Modal ─────────────────────────────────────────────────────────
function RateTutorModal({
  sessionId,
  tutorName,
  onClose,
  onSuccess,
}: {
  sessionId: string;
  tutorName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    try {
      await api.rateTutoring(sessionId, rating, feedback || undefined);
      onSuccess();
    } catch (e: any) {
      alert(e.response?.data?.message || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-sm w-full border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Calificar a {tutorName}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-3">¿Cómo fue tu experiencia con el tutor?</p>
            <StarRating value={rating} onChange={setRating} />
            {rating > 0 && (
              <p className="text-xs text-slate-400 mt-2">
                {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][rating]}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Comentario (opcional)</label>
            <textarea
              rows={3}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Comparte tu experiencia..."
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!rating || submitting}
              className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-lg transition-all disabled:opacity-50"
            >
              {submitting ? 'Enviando...' : 'Enviar calificación'}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
