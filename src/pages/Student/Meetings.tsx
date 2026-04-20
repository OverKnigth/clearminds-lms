import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import Footer from '../../components/Footer';
import Modal from '../../components/Modal';
import DateTimePicker from '../../components/DateTimePicker';

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
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [earnedBadge, setEarnedBadge] = useState<any | null>(null);

  useEffect(() => {
    loadData();
    // Solo si hay un bloque preseleccionado en el estado de navegación (desde CourseView)
    if (location.state && (location.state as any).preselectedBlockId) {
      setPreselectedBlockId((location.state as any).preselectedBlockId);
      setShowModal(true);
      // Limpiar el estado para que no se abra de nuevo al recargar
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [tr, cr] = await Promise.allSettled([api.getStudentTutoring(), api.getStudentCourses()]);
      if (tr.status === 'fulfilled' && tr.value.success) setTutorings(tr.value.data);
      if (cr.status === 'fulfilled' && cr.value.success) setCourses(cr.value.data);
    } catch (e) { console.error(e); }
    finally { if (!silent) setIsLoading(false); }
  };

  const pending = tutorings.filter(t => t.status === 'requested');
  const confirmed = tutorings.filter(t => t.status === 'confirmed' || t.status === 'rescheduled');
  const completed = tutorings.filter(t => t.status === 'executed');
  void pending; void confirmed; void completed; // used in stats only

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
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Calendario
              </button>
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

        {/* Calendar or List View */}
        {viewMode === 'calendar' ? (
          <CalendarView tutorings={tutorings} currentDate={currentDate} setCurrentDate={setCurrentDate} />
        ) : (
          <>
            {tutorings.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-xl">
                <p className="text-slate-400 mb-2">No tienes tutorías aún</p>
                <p className="text-slate-500 text-sm">Completa los bloques de tus cursos para solicitar tutorías</p>
              </div>
            ) : (
              <div className="bg-slate-800 border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/60">
                        <th className="px-4 py-3 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Bloque / Curso</th>
                        <th className="px-4 py-3 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                        <th className="px-4 py-3 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Tutor</th>
                        <th className="px-4 py-3 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Solicitada</th>
                        <th className="px-4 py-3 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Programada</th>
                        <th className="px-4 py-3 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest">Nota</th>
                        <th className="px-4 py-3 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Observaciones</th>
                        <th className="px-4 py-3 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      {tutorings.map(t => {
                        const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.requested;
                        const isApproved = t.status === 'executed' && t.grade != null && t.grade >= 7;
                        const isNotApproved = t.status === 'executed' && t.grade != null && t.grade < 7;
                        const isCancelled = t.status === 'cancelled';
                        return (
                          <TutoringRow
                            key={t.id}
                            tutoring={t}
                            cfg={cfg}
                            isApproved={isApproved}
                            isNotApproved={isNotApproved}
                            isCancelled={isCancelled}
                            onRated={loadData}
                            onBadgeEarned={setEarnedBadge}
                            onReagend={() => {
                              setPreselectedBlockId(t.block.id);
                              setShowModal(true);
                            }}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <RequestModal 
          courses={courses} 
          initialBlockId={preselectedBlockId || ''} 
          onClose={() => setShowModal(false)} 
          onSuccess={() => loadData(true)} 
          onError={(msg) => setError(msg)}
        />
      )}

      {/* Modal de Error personalizado */}
      <Modal 
        isOpen={!!error} 
        onClose={() => setError(null)} 
        title="Atención"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-slate-300 text-lg mb-6">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
          >
            Entendido
          </button>
        </div>
      </Modal>
      {earnedBadge && (
        <BadgeAwardModal 
          badge={earnedBadge} 
          onClose={() => setEarnedBadge(null)} 
        />
      )}

      <Footer />
    </div>
  );
}

// ── Calendar View Component ──────────────────────────────────────────────────
function CalendarView({ 
  tutorings, 
  currentDate, 
  setCurrentDate,
}: { 
  tutorings: Tutoring[]; 
  currentDate: Date; 
  setCurrentDate: (d: Date) => void;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
  
  // Group tutorings by date
  const tutoringsByDate: Record<string, Tutoring[]> = {};
  tutorings.forEach(t => {
    if (t.scheduled_at) {
      const date = new Date(t.scheduled_at);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!tutoringsByDate[key]) tutoringsByDate[key] = [];
      tutoringsByDate[key].push(t);
    }
  });
  
  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${month}-${day}`;
    const dayTutorings = tutoringsByDate[dateKey] || [];
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
    
    days.push(
      <div
        key={day}
        className={`aspect-square border border-slate-700 p-2 ${isToday ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800'} rounded-lg relative`}
      >
        <span className={`text-sm font-semibold ${isToday ? 'text-red-400' : 'text-slate-300'}`}>{day}</span>
        {dayTutorings.length > 0 && (
          <div className="mt-1 space-y-1">
            {dayTutorings.slice(0, 2).map(t => {
              const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.requested;
              return (
                <div
                  key={t.id}
                  className={`text-[10px] px-1 py-0.5 rounded bg-${cfg.color}-500/20 text-${cfg.color}-400 truncate`}
                  title={`${t.block.name} - ${cfg.label}`}
                >
                  {t.block.name.substring(0, 15)}
                </div>
              );
            })}
            {dayTutorings.length > 2 && (
              <div className="text-[9px] text-slate-500">+{dayTutorings.length - 2} más</div>
            )}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{monthNames[month]} {year}</h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={nextMonth}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(name => (
          <div key={name} className="text-center text-xs font-bold text-slate-500 py-2">
            {name}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {days}
      </div>
    </div>
  );
}

function RequestModal({ courses, initialBlockId, onClose, onSuccess, onError }: { courses: Course[]; initialBlockId?: string; onClose: () => void; onSuccess: () => void; onError: (msg: string) => void }) {
  const [blockId, setBlockId] = useState(initialBlockId || '');
  const [observations, setObservations] = useState('');
  const [requestDate, setRequestDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [submitting, setSubmitting] = useState(false);
  const [disabledSlots, setDisabledSlots] = useState<string[]>([]);

  useEffect(() => {
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
  }, []);

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
      // Send the date as a nominal UTC string (no timezone shift) to match user expectations
      const isoDate = `${requestDate}:00.000Z`;
      await (api as any).requestTutoring(blockId, observations || undefined, isoDate);
      onSuccess();
      onClose();
    } catch (e: any) { 
      const msg = e.response?.data?.message || e.message;
      onError(msg);
    }
    finally { setSubmitting(false); }
  };

  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  void today; // suppress TS warning

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
          {/* Bloque */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Bloque *</label>
            <select required value={blockId} onChange={e => setBlockId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm">
              <option value="">Selecciona un bloque</option>
              {blocks.map(b => (
                <option key={b.id} value={b.id}>{b.courseName} — {b.name}</option>
              ))}
            </select>
            {blocks.length === 0 && (
              <p className="text-xs text-slate-500 mt-1">No hay bloques disponibles.</p>
            )}
          </div>

          {/* Fecha de solicitud */}
          <DateTimePicker 
            label="Fecha de Solicitud"
            value={requestDate}
            onChange={setRequestDate}
            minDate={new Date().toISOString().slice(0, 16)}
            disabledSlots={disabledSlots}
          />

          {/* Observación */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Observación <span className="text-slate-600 normal-case font-medium">(opcional)</span>
            </label>
            <textarea
              rows={3}
              value={observations}
              onChange={e => setObservations(e.target.value)}
              placeholder="Ej: Tengo dudas sobre el tema X, me gustaría reforzar..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none placeholder-slate-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting || !blockId}
              className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-widest rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {submitting ? 'Enviando...' : 'Solicitar Tutoría'}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── TutoringRow Component (table row) ───────────────────────────────────────
function TutoringRow({
  tutoring, cfg, isApproved, isNotApproved, isCancelled, onReagend
}: {
  tutoring: Tutoring;
  cfg: { color: string; label: string };
  isApproved: boolean;
  isNotApproved: boolean;
  isCancelled: boolean;
  onRated: () => void;
  onBadgeEarned: (badge: any) => void;
  onReagend: () => void;
}) {

  const colorMap: Record<string, string> = {
    yellow: 'bg-yellow-500/20 text-yellow-400',
    blue:   'bg-blue-500/20 text-blue-400',
    green:  'bg-green-500/20 text-green-400',
    red:    'bg-red-500/20 text-red-400',
  };
  const badgeCls = colorMap[cfg.color] ?? colorMap.yellow;

  return (
    <>
      <tr className="hover:bg-slate-700/20 transition-colors">
        {/* Bloque / Curso */}
        <td className="px-4 py-3">
          <p className="text-xs font-black text-white uppercase tracking-tighter">{tutoring.block.name}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{tutoring.block.course.name}</p>
          {tutoring.attempt_number > 1 && (
            <span className="text-[9px] font-black text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-full border border-orange-500/20 mt-0.5 inline-block">
              Intento #{tutoring.attempt_number}
            </span>
          )}
        </td>

        {/* Estado */}
        <td className="px-4 py-3">
          <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${badgeCls}`}>
            {cfg.label}
          </span>
        </td>

        {/* Tutor */}
        <td className="px-4 py-3 text-xs text-slate-300">
          {tutoring.tutor ? `${tutoring.tutor.names} ${tutoring.tutor.lastNames}` : <span className="text-slate-600">—</span>}
        </td>

        {/* Solicitada */}
        <td className="px-4 py-3 text-xs text-slate-400">
          {new Date(tutoring.requested_at).toLocaleDateString('es-ES')}
        </td>

        {/* Programada */}
        <td className="px-4 py-3 text-xs text-slate-400">
          {tutoring.scheduled_at
            ? new Date(tutoring.scheduled_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
            : <span className="text-slate-600">—</span>}
        </td>

        {/* Nota */}
        <td className="px-4 py-3 text-center">
          {tutoring.grade != null ? (
            <span className={`text-sm font-black ${isApproved ? 'text-green-400' : 'text-red-400'}`}>
              {tutoring.grade}/10
            </span>
          ) : (
            <span className="text-slate-600 text-xs">—</span>
          )}
        </td>

        {/* Observaciones / Motivo de cancelación */}
        <td className="px-4 py-3 text-xs max-w-[200px]">
          {tutoring.cancellation_reason && (
            <span className="text-red-400 italic">{tutoring.cancellation_reason}</span>
          )}
          {tutoring.observations && !tutoring.cancellation_reason && (
            <span className="text-slate-400 italic">{tutoring.observations}</span>
          )}
          {!tutoring.cancellation_reason && !tutoring.observations && (
            <span className="text-slate-600">—</span>
          )}
        </td>

        {/* Acciones */}
        <td className="px-4 py-3">
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            {/* Unirse a la reunión */}
            {(tutoring.status === 'confirmed' || tutoring.status === 'rescheduled') && tutoring.meeting_link && (
              <a href={tutoring.meeting_link} target="_blank" rel="noopener noreferrer"
                className="text-center py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all">
                Unirse
              </a>
            )}

            {/* Ver grabación */}
            {tutoring.recording_link && (
              <a href={tutoring.recording_link} target="_blank" rel="noopener noreferrer"
                className="text-center py-1.5 px-3 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/40 text-purple-400 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all">
                Ver grabación
              </a>
            )}

            {/* Rating ya dado */}
            {tutoring.tutor_rating && (
              <div className="flex items-center gap-1">
                {'★'.repeat(tutoring.tutor_rating).split('').map((s, i) => (
                  <span key={i} className="text-yellow-400 text-xs">{s}</span>
                ))}
              </div>
            )}

            {/* Reagendar (no aprobado) */}
            {isNotApproved && (
              <button onClick={onReagend}
                className="py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all">
                Reagendar
              </button>
            )}

            {/* Volver a solicitar (cancelada) */}
            {isCancelled && (
              <button onClick={onReagend}
                className="py-1.5 px-3 bg-orange-600 hover:bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all">
                Volver a solicitar
              </button>
            )}

            {/* Aprobado */}
            {isApproved && !tutoring.tutor_rating && (
              <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">Aprobado</span>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}

// ── Badge Award Modal ────────────────────────────────────────────────────────
function BadgeAwardModal({ badge, onClose }: { badge: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} 
            className="absolute animate-bounce opacity-20 text-yellow-400 text-2xl"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}>★</div>
        ))}
      </div>

      <div className="bg-slate-800 rounded-3xl max-w-sm w-full border border-yellow-500/30 p-8 shadow-[0_0_50px_rgba(234,179,8,0.2)] text-center relative">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-2xl p-0.5 shadow-lg shadow-yellow-500/20">
          <div className="w-full h-full bg-slate-800 rounded-[14px] flex items-center justify-center overflow-hidden">
            {badge.imageUrl ? (
              <img src={badge.imageUrl} alt={badge.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">🏆</span>
            )}
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">¡Felicidades!</h2>
        <p className="text-slate-400 text-sm mb-6">
          Has obtenido una nueva insignia por tu excelente desempeño:
        </p>
        
        <div className="bg-slate-700/30 rounded-2xl p-4 mb-8 border border-white/5">
          <p className="text-xl font-black text-yellow-400 uppercase tracking-tighter mb-1">{badge.name}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{badge.description}</p>
        </div>

        <button onClick={onClose}
          className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-yellow-500/20 active:scale-95">
          Continuar
        </button>
      </div>
    </div>
  );
}
