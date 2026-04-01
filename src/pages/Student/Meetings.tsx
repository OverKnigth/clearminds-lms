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
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());

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
          <CalendarView tutorings={tutorings} currentDate={currentDate} setCurrentDate={setCurrentDate} onRated={loadData} />
        ) : (
          <>
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
                      allTutorings={tutorings}
                      showJoin={section.showJoin}
                      showResults={section.showResults}
                      onRated={loadData}
                      onReagend={() => {
                        setPreselectedBlockId(t.block.id);
                        setShowModal(true);
                      }}
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
          </>
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

// ── Calendar View Component ──────────────────────────────────────────────────
function CalendarView({ 
  tutorings, 
  currentDate, 
  setCurrentDate,
  onRated 
}: { 
  tutorings: Tutoring[]; 
  currentDate: Date; 
  setCurrentDate: (d: Date) => void;
  onRated: () => void;
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

function RequestModal({ courses, initialBlockId, onClose, onSuccess }: { courses: Course[]; initialBlockId?: string; onClose: () => void; onSuccess: () => void }) {
  const [blockId, setBlockId] = useState(initialBlockId || '');
  const [observations, setObservations] = useState('');
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
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
      await (api as any).requestTutoring(blockId, observations || undefined);
      onSuccess();
      onClose();
    } catch (e: any) { alert(e.response?.data?.message || e.message); }
    finally { setSubmitting(false); }
  };

  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fecha de Solicitud</label>
            <input
              type="date"
              value={requestDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setRequestDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

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
  allTutorings,
  showJoin,
  showResults,
  onRated,
  onReagend,
}: {
  tutoring: Tutoring;
  allTutorings?: Tutoring[];
  showJoin?: boolean;
  showResults?: boolean;
  onRated: () => void;
  onReagend?: () => void;
}) {
  const cfg = STATUS_CONFIG[tutoring.status] || STATUS_CONFIG.requested;
  const [showRateModal, setShowRateModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Get all attempts for this block (history)
  const blockHistory = (allTutorings || [])
    .filter(t => t.block.id === tutoring.block.id && t.status === 'executed')
    .sort((a, b) => a.attempt_number - b.attempt_number);

  const isNotApproved = tutoring.status === 'executed' && tutoring.grade !== null && tutoring.grade !== undefined && tutoring.grade < 7;
  const isApproved = tutoring.status === 'executed' && tutoring.grade !== null && tutoring.grade !== undefined && tutoring.grade >= 7;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-slate-700/50">
        <div>
          <p className="text-white font-black text-sm uppercase tracking-tighter">{tutoring.block.name}</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{tutoring.block.course.name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {tutoring.attempt_number > 1 && (
            <span className="text-[9px] font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
              Intento #{tutoring.attempt_number}
            </span>
          )}
          <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-${cfg.color}-500/20 text-${cfg.color}-400`}>
            {cfg.label}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {/* Info */}
        <div className="space-y-1.5 text-xs">
          {tutoring.tutor && (
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold uppercase tracking-widest">Tutor</span>
              <span className="text-slate-300 font-bold">{tutoring.tutor.names} {tutoring.tutor.lastNames}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500 font-bold uppercase tracking-widest">Solicitada</span>
            <span className="text-slate-300">{new Date(tutoring.requested_at).toLocaleDateString('es-ES')}</span>
          </div>
          {tutoring.scheduled_at && (
            <div className="flex justify-between">
              <span className="text-slate-500 font-bold uppercase tracking-widest">Programada</span>
              <span className="text-slate-300">{new Date(tutoring.scheduled_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
          )}
          {tutoring.cancellation_reason && (
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-[10px] text-red-400 font-black uppercase tracking-widest mb-0.5">Cancelada</p>
              <p className="text-xs text-slate-400">{tutoring.cancellation_reason}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {showResults && tutoring.grade !== undefined && tutoring.grade !== null && (
          <div className={`p-3 rounded-lg border ${isApproved ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resultado</span>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-black ${isApproved ? 'text-green-400' : 'text-red-400'}`}>{tutoring.grade}/10</span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${isApproved ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {isApproved ? '✓ Aprobado' : '✗ No aprobado'}
                </span>
              </div>
            </div>
            {tutoring.observations && (
              <p className="text-xs text-slate-400 mt-1 italic border-t border-slate-700/50 pt-1">"{tutoring.observations}"</p>
            )}
            {tutoring.recording_link && (
              <a href={tutoring.recording_link} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-[10px] font-black uppercase tracking-widest mt-2 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ver grabación
              </a>
            )}
          </div>
        )}

        {/* Tutor rating */}
        {showResults && tutoring.grade !== undefined && tutoring.grade !== null && (
          <div className="border-t border-slate-700/50 pt-3">
            {tutoring.tutor_rating ? (
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Tu calificación al tutor</p>
                <StarRating value={tutoring.tutor_rating} readonly />
              </div>
            ) : (
              <button onClick={() => setShowRateModal(true)}
                className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-yellow-400 hover:text-yellow-300 border border-yellow-500/30 hover:border-yellow-500/60 rounded-lg transition-colors flex items-center justify-center gap-1">
                ★ Calificar al tutor
              </button>
            )}
          </div>
        )}

        {/* Reagendar button — only when not approved */}
        {isNotApproved && onReagend && (
          <button onClick={onReagend}
            className="w-full py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reagendar Tutoría
          </button>
        )}

        {/* Join button */}
        {showJoin && tutoring.meeting_link && (
          <a href={tutoring.meeting_link} target="_blank" rel="noopener noreferrer"
            className="block text-center py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-all">
            Unirse a la reunión
          </a>
        )}

        {/* History toggle */}
        {blockHistory.length > 1 && (
          <button onClick={() => setShowHistory(!showHistory)}
            className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-1">
            {showHistory ? '▲' : '▼'} Historial de intentos ({blockHistory.length})
          </button>
        )}

        {/* History table */}
        {showHistory && blockHistory.length > 0 && (
          <div className="border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-3 py-2 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">#</th>
                  <th className="px-3 py-2 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Fecha</th>
                  <th className="px-3 py-2 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest">Nota</th>
                  <th className="px-3 py-2 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {blockHistory.map(h => (
                  <tr key={h.id} className="hover:bg-slate-700/20">
                    <td className="px-3 py-2 text-slate-400 font-bold">{h.attempt_number}</td>
                    <td className="px-3 py-2 text-slate-400">{h.executed_at ? new Date(h.executed_at).toLocaleDateString('es-ES') : '—'}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`font-black ${h.grade !== null && h.grade !== undefined ? (h.grade >= 7 ? 'text-green-400' : 'text-red-400') : 'text-slate-500'}`}>
                        {h.grade !== null && h.grade !== undefined ? `${h.grade}/10` : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${h.grade !== null && h.grade !== undefined ? (h.grade >= 7 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400') : 'bg-slate-700 text-slate-500'}`}>
                        {h.grade !== null && h.grade !== undefined ? (h.grade >= 7 ? 'Aprobado' : 'No aprobado') : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
