import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import Modal from './Modal';

export interface SharedTutoringSession {
  id: string;
  status: 'requested' | 'confirmed' | 'rescheduled' | 'cancelled' | 'executed';
  requestedAt: string;
  scheduledAt?: string | null;
  executedAt?: string | null;
  meetingLink?: string | null;
  recordingLink?: string | null;
  grade?: number | null;
  observations?: string | null;
  attemptNumber: number;
  cancellationReason?: string | null;
  tutorRating?: number | null;
  tutorFeedback?: string | null;
  block: { 
    id: string; 
    name: string; 
    course: { id?: string; name: string } 
  };
  student: { 
    id: string; 
    names: string; 
    lastNames?: string; 
    last_names?: string; 
    email: string 
  } | null;
  tutor?: { 
    id: string; 
    names: string; 
    lastNames?: string; 
    last_names?: string; 
  } | null;
}

interface TutoringCalendarProps {
  sessions: SharedTutoringSession[];
  onSessionUpdate?: () => void;
  isLoading?: boolean;
}

type HourRangePreset = 'all' | 'morning' | 'afternoon' | 'evening';

const HOUR_PRESET_LABELS: Record<HourRangePreset, string> = {
  all: 'Todas las horas',
  morning: '10:00 – 14:00',
  afternoon: '14:00 – 18:00',
  evening: '18:00 – 22:00',
};

const HOUR_PRESET_KEYS = Object.keys(HOUR_PRESET_LABELS) as HourRangePreset[];

export default function TutoringCalendar({ sessions, isLoading }: TutoringCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [detailModalSession, setDetailModalSession] = useState<SharedTutoringSession | null>(null);
  const [hourPreset, setHourPreset] = useState<HourRangePreset>('all');
  const [filterTutor, setFilterTutor] = useState('');
  const [filterStudent, setFilterStudent] = useState('');

  const sessionsByDay = useMemo(() => {
    const map: Record<string, SharedTutoringSession[]> = {};
    for (const s of sessions) {
      const ts = s.scheduledAt || (s.status === 'requested' ? s.requestedAt : null);
      if (!ts) continue;
      const d = new Date(ts);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => {
        const ta = new Date(a.scheduledAt || a.requestedAt || 0).getTime();
        const tb = new Date(b.scheduledAt || b.requestedAt || 0).getTime();
        return ta - tb;
      });
    }
    return map;
  }, [sessions]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const selectedSessions = selectedDayKey ? sessionsByDay[selectedDayKey] || [] : [];
  
  const filteredSessions = useMemo(() => {
    const tq = filterTutor.trim().toLowerCase();
    const sq = filterStudent.trim().toLowerCase();
    
    return selectedSessions.filter(s => {
      const ts = s.scheduledAt || s.requestedAt;
      const d = new Date(ts);
      const mins = d.getHours() * 60 + d.getMinutes();
      
      let matchHour = true;
      if (hourPreset === 'morning') matchHour = mins >= 10*60 && mins < 14*60;
      else if (hourPreset === 'afternoon') matchHour = mins >= 14*60 && mins < 18*60;
      else if (hourPreset === 'evening') matchHour = mins >= 18*60 && mins < 22*60;
      
      if (!matchHour) return false;
      
      if (tq && s.tutor) {
        const name = `${s.tutor.names} ${s.tutor.lastNames || s.tutor.last_names || ''}`.toLowerCase();
        if (!name.includes(tq)) return false;
      }
      
      if (sq && s.student) {
        const name = `${s.student.names} ${s.student.lastNames || s.student.last_names || ''}`.toLowerCase();
        if (!name.includes(sq)) return false;
      }
      
      return true;
    });
  }, [selectedSessions, hourPreset, filterTutor, filterStudent]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 bg-slate-800 rounded-lg border border-slate-700">
        <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  const days: ReactNode[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`e-${i}`} className="min-h-[90px] rounded-lg bg-slate-900/40 border border-slate-800" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${month}-${day}`;
    const daySessions = sessionsByDay[dateKey] || [];
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
    const isSelected = selectedDayKey === dateKey;

    days.push(
      <button
        key={dateKey}
        onClick={() => setSelectedDayKey(isSelected ? null : dateKey)}
        className={`min-h-[90px] text-left border rounded-lg p-2 transition-all ${
          isSelected ? 'ring-2 ring-red-500 border-red-500/50 bg-slate-800 shadow-lg' : 
          isToday ? 'bg-red-500/10 border-red-500/30 hover:bg-slate-800' : 
          'bg-slate-800 border-slate-700 hover:border-slate-600'
        }`}
      >
        <span className={`text-xs font-black ${isToday ? 'text-red-400' : 'text-slate-200'}`}>{day}</span>
        <div className="mt-1 space-y-1">
          {daySessions.slice(0, 2).map(s => (
            <div key={s.id} className={`text-[8px] font-black uppercase px-1 py-0.5 rounded border ${getStatusClass(s.status)} truncate`}>
              {new Date(s.scheduledAt || s.requestedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false})} - {s.student?.names?.split(' ')[0] || '---'}
            </div>
          ))}
          {daySessions.length > 2 && <div className="text-[8px] text-slate-500 font-black pl-1">+{daySessions.length - 2} más</div>}
        </div>
      </button>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      {/* Calendar Grid */}
      <div className="xl:col-span-8 bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col h-[650px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-white uppercase tracking-tighter">
            {new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(currentDate)}
          </h3>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-white">Hoy</button>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">{d}</div>
          ))}
        </div>
        
        <div className="flex-1 overflow-y-auto grid grid-cols-7 gap-1.5 pb-2 custom-scrollbar">
          {days}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700 flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-widest text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Solicitada</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Confirmada</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500" /> Reagendada</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500" /> Ejecutada</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500" /> Cancelada</span>
        </div>
      </div>

      {/* Side Panel Details */}
      <div className="xl:col-span-4 bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col h-[650px]">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
          {selectedDayKey ? `Sesiones del día ${selectedDayKey.split('-')[2]}/${parseInt(selectedDayKey.split('-')[1]) + 1}` : 'Selecciona un día'}
        </p>

        <div className="space-y-3 mb-4 pb-4 border-b border-slate-700">
          <div className="grid grid-cols-4 gap-1">
            {HOUR_PRESET_KEYS.map(key => (
              <button 
                key={key} 
                onClick={() => setHourPreset(key)}
                className={`flex-1 py-1.5 text-[7px] font-black uppercase rounded border transition-all ${hourPreset === key ? 'bg-red-600 text-white border-red-500' : 'bg-slate-700 text-slate-400 border-slate-600 hover:border-slate-500'}`}
              >
                {HOUR_PRESET_LABELS[key].split(' – ')[0]}
              </button>
            ))}
          </div>
          <input 
            type="text" 
            placeholder="Buscar Tutor..." 
            value={filterTutor} 
            onChange={e => setFilterTutor(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <input 
            type="text" 
            placeholder="Buscar Estudiante..." 
            value={filterStudent} 
            onChange={e => setFilterStudent(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
          {filteredSessions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10 uppercase font-black tracking-widest italic">No hay sesiones que mostrar</p>
          ) : (
            filteredSessions.map(s => (
              <button 
                key={s.id} 
                onClick={() => setDetailModalSession(s)}
                className="w-full text-left bg-slate-900/50 border border-slate-700 rounded-xl p-3 hover:border-slate-500 transition-all group"
              >
                <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-[10px] font-bold text-slate-400">{new Date(s.scheduledAt || s.requestedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false})}</span>
                <span className={`text-[8px] px-2 py-0.5 rounded-full border font-black uppercase ${getStatusClass(s.status)}`}>{s.status}</span>
              </div>
              <h4 className="text-[11px] font-black text-white uppercase tracking-tighter truncate">{s.student?.names || 'Estudiante'} {s.student?.lastNames || s.student?.last_names || ''}</h4>
              <p className="text-[9px] text-slate-500 font-bold uppercase truncate">{s.block?.course?.name || 'Curso'} - {s.block?.name || 'Bloque'}</p>
              {s.tutor && <p className="text-[9px] text-red-400/80 font-black uppercase mt-1 truncate">Tutor: {s.tutor.names}</p>}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Session Details Modal */}
      {detailModalSession && (
        <Modal 
          isOpen={!!detailModalSession} 
          onClose={() => setDetailModalSession(null)} 
          title="Detalle de Tutoría"
          panelClassName="max-w-2xl"
        >
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border ${getStatusClass(detailModalSession.status)}`}>
               <div className="flex justify-between items-center mb-1">
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Estado</span>
                 <span className="text-xs font-black uppercase tracking-tighter">{detailModalSession.status}</span>
               </div>
               <p className="text-sm font-black uppercase">{detailModalSession.block.course.name}</p>
               <p className="text-xs opacity-80">{detailModalSession.block.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-700">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Estudiante</p>
                <p className="text-xs font-bold text-white mb-0.5">{detailModalSession.student?.names} {detailModalSession.student?.lastNames || detailModalSession.student?.last_names}</p>
                <p className="text-[10px] text-slate-400 truncate">{detailModalSession.student?.email}</p>
              </div>
              <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-700">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Tutor</p>
                <p className="text-xs font-bold text-white">{detailModalSession.tutor ? `${detailModalSession.tutor.names} ${detailModalSession.tutor.lastNames || detailModalSession.tutor.last_names || ''}` : '—'}</p>
              </div>
            </div>

            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-black uppercase tracking-widest">Programada</span>
                <span className="text-slate-200 font-bold">{detailModalSession.scheduledAt ? new Date(detailModalSession.scheduledAt).toLocaleString() : 'Pendiente'}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-black uppercase tracking-widest">Solicitada</span>
                <span className="text-slate-300">{new Date(detailModalSession.requestedAt).toLocaleString()}</span>
              </div>
              {detailModalSession.executedAt && (
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-black uppercase tracking-widest">Ejecutada</span>
                  <span className="text-slate-300">{new Date(detailModalSession.executedAt).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 font-black uppercase tracking-widest">Intento</span>
                <span className="text-slate-300 font-bold"># {detailModalSession.attemptNumber}</span>
              </div>
              {detailModalSession.grade !== undefined && detailModalSession.grade !== null && (
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-black uppercase tracking-widest">Calificación</span>
                  <span className={`font-black ${detailModalSession.grade >= 7 ? 'text-green-400' : 'text-red-400'}`}>{detailModalSession.grade}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {detailModalSession.meetingLink && (
                <a href={detailModalSession.meetingLink} target="_blank" rel="noreferrer" className="block w-full py-2.5 bg-red-600 hover:bg-red-500 text-white text-center text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-red-900/20">
                  Enlace de Reunión
                </a>
              )}
              {detailModalSession.recordingLink && (
                <a href={detailModalSession.recordingLink} target="_blank" rel="noreferrer" className="block w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-center text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-slate-600">
                  Ver Grabación
                </a>
              )}
            </div>

            {detailModalSession.observations && (
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Observaciones</p>
                <p className="text-xs text-slate-300 italic">{detailModalSession.observations}</p>
              </div>
            )}

            {detailModalSession.cancellationReason && (
              <div className="bg-red-500/5 p-3 rounded-lg border border-red-500/20">
                <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Motivo de Cancelación</p>
                <p className="text-xs text-red-200/70 italic">{detailModalSession.cancellationReason}</p>
              </div>
            )}

            {detailModalSession.tutorRating && (
              <div className="bg-amber-500/5 p-3 rounded-lg border border-amber-500/20">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Calificación al Tutor</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-white">{detailModalSession.tutorRating}</span>
                    <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  </div>
                </div>
                {detailModalSession.tutorFeedback && <p className="text-xs text-amber-200/70 italic">{detailModalSession.tutorFeedback}</p>}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function getStatusClass(status: SharedTutoringSession['status']): string {
  switch (status) {
    case 'confirmed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'rescheduled': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    case 'requested': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'executed': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    case 'cancelled': return 'bg-slate-600/10 text-slate-400 border-slate-600/20';
    default: return 'bg-slate-700 text-white border-transparent';
  }
}
