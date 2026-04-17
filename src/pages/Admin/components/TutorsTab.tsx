import { useState, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { api } from '../../../services/api';
import { useDialog } from '../../../hooks/useDialog';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import Modal from '../../../components/Modal';
import type { Student } from '../types';

/** Respuesta de GET /admin/tutoring (misma forma que usa TutoringSessionsTab) */
export interface AdminTutoringSessionRow {
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
  block: { id: string; name: string; course: { id?: string; name: string } };
  student: { id: string; names: string; last_names: string; email: string };
  tutor: { id: string; names: string; last_names: string } | null;
}

function sessionCalendarTimestamp(s: AdminTutoringSessionRow): string | null {
  if (s.scheduledAt) return s.scheduledAt;
  if (s.status === 'requested') return s.requestedAt;
  return null;
}

function dayKeyFromIso(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function statusChipClass(status: AdminTutoringSessionRow['status']): string {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'rescheduled':
      return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    case 'requested':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'executed':
      return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
    case 'cancelled':
      return 'bg-slate-600/40 text-slate-400 border-slate-500/30';
    default:
      return 'bg-slate-600/30 text-slate-400 border-slate-600';
  }
}

function statusLabel(status: AdminTutoringSessionRow['status']): string {
  const map: Record<string, string> = {
    requested: 'Solicitada',
    confirmed: 'Confirmada',
    rescheduled: 'Reagendada',
    cancelled: 'Cancelada',
    executed: 'Ejecutada',
  };
  return map[status] || status;
}

function formatTimeWithSeconds(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function formatDateTimeLong(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/** Minutos desde medianoche (0–1439) para filtrar por franja horaria */
function minutesSinceMidnight(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.getHours() * 60 + d.getMinutes();
}

type HourRangePreset = 'all' | 'morning' | 'afternoon' | 'evening';

const HOUR_PRESET_LABELS: Record<HourRangePreset, string> = {
  all: 'Todas las horas',
  morning: '10:00 – 14:00',
  afternoon: '14:00 – 18:00',
  evening: '18:00 – 22:00',
};

const HOUR_PRESET_KEYS = Object.keys(HOUR_PRESET_LABELS) as HourRangePreset[];

function HourPresetSelect({
  value,
  onChange,
  'aria-labelledby': ariaLabelledBy,
}: {
  value: HourRangePreset;
  onChange: (v: HourRangePreset) => void;
  'aria-labelledby'?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    // `click` evita competir con el cierre al elegir una opción (mejor que solo mousedown)
    document.addEventListener('click', close, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', close, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        id="hour-preset-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-600 bg-slate-900/90 px-3 py-2.5 text-left text-xs font-medium text-white shadow-sm transition-colors hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/80"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls="hour-preset-listbox"
        aria-labelledby={ariaLabelledBy}
      >
        <span className="truncate">{HOUR_PRESET_LABELS[value]}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          id="hour-preset-listbox"
          role="listbox"
          aria-labelledby={ariaLabelledBy ?? 'hour-preset-trigger'}
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-lg border border-slate-600 bg-slate-900 py-1 shadow-xl shadow-black/50 ring-1 ring-slate-700/50"
        >
          {HOUR_PRESET_KEYS.map((key) => {
            const selected = value === key;
            return (
              <li key={key} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`w-full px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                    selected
                      ? 'bg-slate-700/90 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onChange(key);
                    setOpen(false);
                  }}
                >
                  {HOUR_PRESET_LABELS[key]}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function matchesHourPreset(minutes: number | null, preset: HourRangePreset): boolean {
  if (preset === 'all' || minutes == null) return true;
  if (preset === 'morning') return minutes >= 10 * 60 && minutes < 14 * 60;
  if (preset === 'afternoon') return minutes >= 14 * 60 && minutes < 18 * 60;
  return minutes >= 18 * 60 && minutes < 22 * 60;
}

function normalizeSearch(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function filterDetailSessions(
  sessions: AdminTutoringSessionRow[],
  hourPreset: HourRangePreset,
  tutorQ: string,
  studentQ: string
): AdminTutoringSessionRow[] {
  const tq = normalizeSearch(tutorQ);
  const sq = normalizeSearch(studentQ);
  return sessions.filter((s) => {
    const ts = sessionCalendarTimestamp(s);
    const mins = minutesSinceMidnight(ts);
    if (!matchesHourPreset(mins, hourPreset)) return false;
    if (tq) {
      const tutorName = s.tutor ? normalizeSearch(`${s.tutor.names} ${s.tutor.last_names}`) : '';
      if (!tutorName.includes(tq)) return false;
    }
    if (sq) {
      const stName = normalizeSearch(`${s.student.names} ${s.student.last_names}`);
      if (!stName.includes(sq)) return false;
    }
    return true;
  });
}

interface TutorsTabProps {
  tutors: Student[];
  openModal: (type: 'addTutor' | 'editStudent' | 'resetPassword', student?: Student) => void;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onToggleStatus: (tutor: Student) => void;
  onDelete?: (tutor: Student) => void;
}

export function TutorsTab({ tutors, openModal, currentPage, totalItems, itemsPerPage, onPageChange, onToggleStatus, onDelete }: TutorsTabProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const [subTab, setSubTab] = useState<'list' | 'rules' | 'calendar'>('list');
  const { dialog, showAlert, close: closeDialog } = useDialog();

  const [calendarSessions, setCalendarSessions] = useState<AdminTutoringSessionRow[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  // ── Global message ────────────────────────────────────────────────────────
  const [globalMessage, setGlobalMessage] = useState('');
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgSaving, setMsgSaving] = useState(false);
  const [msgSaved, setMsgSaved] = useState(false);
  const [msgEditing, setMsgEditing] = useState(false);

  useEffect(() => {
    if (subTab === 'rules' && !msgLoading && globalMessage === '') loadMessage();
  }, [subTab]);

  useEffect(() => {
    if (subTab !== 'calendar') return;
    let cancelled = false;
    (async () => {
      setCalendarLoading(true);
      try {
        const res = await api.getAdminTutoringSessions();
        if (!cancelled && res.success && Array.isArray(res.data)) setCalendarSessions(res.data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setCalendarSessions([]);
      } finally {
        if (!cancelled) setCalendarLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [subTab]);

  const sessionsByDay = useMemo(() => {
    const map: Record<string, AdminTutoringSessionRow[]> = {};
    for (const s of calendarSessions) {
      const ts = sessionCalendarTimestamp(s);
      if (!ts) continue;
      const key = dayKeyFromIso(ts);
      if (!key) continue;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => {
        const ta = new Date(sessionCalendarTimestamp(a) || 0).getTime();
        const tb = new Date(sessionCalendarTimestamp(b) || 0).getTime();
        return ta - tb;
      });
    }
    return map;
  }, [calendarSessions]);

  const loadMessage = async () => {
    setMsgLoading(true);
    try {
      const res = await api.getTutoringConfig();
      if (res.success) setGlobalMessage(res.data.globalMessage || '');
    } catch (e) { console.error(e); }
    finally { setMsgLoading(false); }
  };

  const handleSaveMessage = async () => {
    setMsgSaving(true);
    try {
      await api.updateTutoringConfig(globalMessage);
      setMsgSaved(true);
      setMsgEditing(false);
      setTimeout(() => setMsgSaved(false), 2500);
    } catch (e: any) { showAlert(e.response?.data?.message || 'Error al guardar'); }
    finally { setMsgSaving(false); }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-slate-800 border border-slate-700/50 rounded-lg px-6 py-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Gestión de Tutores</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Administra tutores y mensajes de tutoría</p>
        </div>
        {subTab === 'list' && (
          <button onClick={() => openModal('addTutor')}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-red-900/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Tutor
          </button>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-800 rounded-xl w-fit max-w-full border border-slate-700 mb-6">
        <button onClick={() => setSubTab('list')}
          className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${subTab === 'list' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
          Tutores
        </button>
        <button onClick={() => setSubTab('rules')}
          className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${subTab === 'rules' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
          Reglas de Tutoría
        </button>
        <button
          onClick={() => { setSubTab('calendar'); setSelectedDayKey(null); }}
          className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${subTab === 'calendar' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          Calendario Tutorías
        </button>
      </div>

      {/* ── TUTORS LIST ── */}
      {subTab === 'list' && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tutor</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Correo</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {tutors.map((tutor) => (
                <tr key={tutor.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white text-xs font-black">
                        {tutor.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <p className="text-sm font-black text-white uppercase tracking-tighter">{tutor.fullName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">{tutor.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-white font-black text-xs">{(tutor as any).rating > 0 ? (tutor as any).rating.toFixed(1) : '-'}</span>
                      <span className="text-slate-500 text-[10px]">({(tutor as any).reviewsCount || 0})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => onToggleStatus(tutor)}
                      className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border transition-all cursor-pointer ${
                        tutor.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                      }`}>
                      {tutor.status === 'active' ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openModal('editStudent', tutor)} title="Editar"
                        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => openModal('resetPassword', tutor)} title="Restablecer contraseña"
                        className="p-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </button>
                      {onDelete && (
                        <button onClick={() => onDelete(tutor)} title="Eliminar"
                          className="p-2 rounded-lg bg-red-900/10 hover:bg-red-900/30 text-red-500 transition-all">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {tutors.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-[10px] text-slate-600 font-black uppercase tracking-widest">No hay tutores registrados</td></tr>
              )}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-700/50 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mostrando {tutors.length} de {totalItems}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${currentPage === 1 ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>← Anterior</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)).map(page => (
                  <button key={page} onClick={() => onPageChange(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${currentPage === page ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}`}>{page}</button>
                ))}
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${currentPage === totalPages ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-700 text-white hover:bg-slate-600'}`}>Siguiente →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CALENDARIO (todas las sesiones / todos los tutores) ── */}
      {subTab === 'calendar' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest px-1">
            Todas las sesiones de todos los tutores. Usa la fecha programada o, si aún no hay cita, la fecha de solicitud. El enlace de reunión muestra dónde se lleva a cabo cuando está registrado.
          </p>
          {calendarLoading ? (
            <div className="flex justify-center py-20 bg-slate-800 rounded-lg border border-slate-700">
              <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
            </div>
          ) : (
            <AdminTutoringMonthCalendar
              currentDate={calendarMonth}
              setCurrentDate={setCalendarMonth}
              sessionsByDay={sessionsByDay}
              selectedDayKey={selectedDayKey}
              onSelectDay={setSelectedDayKey}
            />
          )}
        </div>
      )}

      {/* ── MESSAGES ── */}
      {subTab === 'rules' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700/50 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-white uppercase tracking-tighter mb-1">Reglas Globales para Tutores</p>
                <p className="text-xs text-slate-500">Este texto aparecerá como aviso en el panel de todos los tutores.</p>
              </div>
              {!msgEditing && globalMessage && (
                <button onClick={() => setMsgEditing(true)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-black text-xs uppercase tracking-widest transition-all border border-slate-600">
                  Editar
                </button>
              )}
            </div>

            {msgLoading ? (
              <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" /></div>
            ) : msgEditing || !globalMessage ? (
              <>
                <textarea
                  rows={6}
                  value={globalMessage}
                  onChange={(e) => setGlobalMessage(e.target.value)}
                  placeholder="Ej: Recuerden registrar el link de grabación al finalizar cada sesión. Las tutorías deben completarse dentro de las 48h de ser solicitadas..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-slate-500"
                />
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-500">{globalMessage.length} caracteres</p>
                  <div className="flex gap-2">
                    {msgEditing && (
                      <button onClick={() => { setMsgEditing(false); loadMessage(); }}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-black text-xs uppercase tracking-widest transition-all">
                        Cancelar
                      </button>
                    )}
                    <button onClick={handleSaveMessage} disabled={msgSaving}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50">
                      {msgSaving ? 'Guardando...' : msgSaved ? '✓ Publicado' : 'Publicar'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Published view */
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Aviso del Administrador — Publicado</p>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{globalMessage}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

function AdminTutoringMonthCalendar({
  currentDate,
  setCurrentDate,
  sessionsByDay,
  selectedDayKey,
  onSelectDay,
}: {
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  sessionsByDay: Record<string, AdminTutoringSessionRow[]>;
  selectedDayKey: string | null;
  onSelectDay: (key: string | null) => void;
}) {
  const [detailModalSession, setDetailModalSession] = useState<AdminTutoringSessionRow | null>(null);
  const [hourPreset, setHourPreset] = useState<HourRangePreset>('all');
  const [filterTutor, setFilterTutor] = useState('');
  const [filterStudent, setFilterStudent] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const selectedSessions = selectedDayKey ? sessionsByDay[selectedDayKey] || [] : [];

  const filteredSessions = useMemo(
    () => filterDetailSessions(selectedSessions, hourPreset, filterTutor, filterStudent),
    [selectedSessions, hourPreset, filterTutor, filterStudent]
  );

  const filterInputCls =
    'w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-600 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500';

  const days: ReactNode[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`e-${i}`} className="min-h-[100px] rounded-lg bg-slate-900/40 border border-slate-800" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${month}-${day}`;
    const daySessions = sessionsByDay[dateKey] || [];
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
    const isSelected = selectedDayKey === dateKey;

    days.push(
      <button
        type="button"
        key={dateKey}
        onClick={() => onSelectDay(isSelected ? null : dateKey)}
        className={`min-h-[100px] text-left border rounded-lg p-1.5 sm:p-2 transition-all ${
          isSelected
            ? 'ring-2 ring-red-500 border-red-500/50 bg-slate-800'
            : isToday
              ? 'bg-red-500/10 border-red-500/30 hover:bg-slate-800'
              : 'bg-slate-800 border-slate-700 hover:border-slate-600'
        }`}
      >
        <span className={`text-xs sm:text-sm font-black ${isToday ? 'text-red-400' : 'text-slate-200'}`}>{day}</span>
        {daySessions.length > 0 && (
          <div className="mt-1 space-y-1">
            {daySessions.slice(0, 2).map((s) => {
              const t = sessionCalendarTimestamp(s);
              const timeStr = formatTimeWithSeconds(t);
              const tutorShort = s.tutor
                ? `${s.tutor.names[0] ?? ''}${s.tutor.last_names[0] ?? ''}`.toUpperCase()
                : '·';
              return (
                <div
                  key={s.id}
                  className={`rounded border px-1 py-0.5 ${statusChipClass(s.status)}`}
                  title={`${s.block.course.name} — ${statusLabel(s.status)} · ${timeStr}`}
                >
                  <div className="font-mono text-[10px] font-black leading-none tracking-tight">{timeStr}</div>
                  <div className="text-[9px] font-black uppercase truncate opacity-95 mt-0.5">{tutorShort}</div>
                </div>
              );
            })}
            {daySessions.length > 2 && (
              <div className="text-[9px] text-slate-500 font-black pl-0.5">+{daySessions.length - 2}</div>
            )}
          </div>
        )}
      </button>
    );
  }

  return (
    <>
      {/* Altura fija en xl: ambas columnas iguales; scroll interno en calendario (rejilla) y en lista de detalles */}
      <div className="flex flex-col xl:flex-row xl:items-stretch gap-4 xl:h-[min(78vh,920px)] xl:min-h-[560px] xl:max-h-[min(78vh,920px)]">
        <div className="w-full xl:flex-[5] xl:min-w-0 xl:min-h-0 xl:h-full flex flex-col rounded-xl border border-slate-700 bg-slate-800 p-4 sm:p-5 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 shrink-0">
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tighter">
              {monthNames[month]} {year}
            </h3>
            <div className="flex gap-1.5 shrink-0">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 sm:p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                aria-label="Mes anterior"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(new Date())}
                className="px-2 sm:px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white transition-colors"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 sm:p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                aria-label="Mes siguiente"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1.5 shrink-0">
            {dayNames.map((d) => (
              <div key={d} className="text-center text-[9px] font-black text-slate-500 uppercase tracking-wider py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar -mx-1 px-1">
            <div className="grid grid-cols-7 gap-1.5 auto-rows-min pb-1">{days}</div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-700/80 flex flex-wrap gap-x-3 gap-y-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" /> Solicitada</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" /> Confirmada</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" /> Reagendada</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-400 shrink-0" /> Ejecutada</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500 shrink-0" /> Cancelada</span>
          </div>
        </div>

        <div
          className="w-full xl:flex-[3] xl:min-w-[260px] xl:max-w-[380px] xl:min-h-0 xl:h-full flex flex-col rounded-xl border border-slate-700 bg-slate-800 p-4 sm:p-5 overflow-x-hidden max-xl:h-[min(58vh,560px)]"
        >
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 shrink-0">
            {selectedDayKey
              ? (() => {
                  const [y, m, d] = selectedDayKey.split('-').map(Number);
                  return `Detalle — ${d}/${m + 1}/${y}`;
                })()
              : 'Selecciona un día'}
          </p>

          <div className="shrink-0 space-y-2 mb-3 pb-3 border-b border-slate-700/60">
            <div className="block">
              <span id="hour-preset-field-label" className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 block">
                Franja horaria
              </span>
              <HourPresetSelect
                value={hourPreset}
                onChange={setHourPreset}
                aria-labelledby="hour-preset-field-label"
              />
            </div>
            <label className="block">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Buscar tutor</span>
              <input
                type="search"
                value={filterTutor}
                onChange={(e) => setFilterTutor(e.target.value)}
                placeholder="Nombre del tutor"
                className={filterInputCls + ' text-xs'}
              />
            </label>
            <label className="block">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Buscar estudiante</span>
              <input
                type="search"
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
                placeholder="Nombre del estudiante"
                className={filterInputCls + ' text-xs'}
              />
            </label>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1 -mr-0.5">
            {!selectedDayKey && (
              <p className="text-sm text-slate-500 pr-1">Elige un día en el calendario. La lista usa solo el scroll de este panel.</p>
            )}
            {selectedSessions.length === 0 && selectedDayKey && (
              <p className="text-sm text-slate-500">No hay sesiones en este día.</p>
            )}
            {selectedSessions.length > 0 && filteredSessions.length === 0 && selectedDayKey && (
              <p className="text-sm text-amber-400/90">Ninguna sesión coincide con los filtros.</p>
            )}
            <ul className="space-y-2 pb-2">
              {filteredSessions.map((s) => {
                const when = sessionCalendarTimestamp(s);
                const timeOnly = formatTimeWithSeconds(when);
                const tutorName = s.tutor ? `${s.tutor.names} ${s.tutor.last_names}` : 'Sin tutor asignado';
                const studentName = `${s.student.names} ${s.student.last_names}`;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      title="Ver detalle completo"
                      onClick={() => setDetailModalSession(s)}
                      className="w-full text-left rounded-lg border border-slate-700 bg-slate-900/50 p-3 transition-all hover:border-slate-500 hover:bg-slate-900/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60 cursor-pointer"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 gap-y-1">
                        <span className="font-mono text-sm font-bold text-slate-200 tabular-nums tracking-tight">
                          {timeOnly}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border font-black uppercase shrink-0 ${statusChipClass(s.status)}`}>
                          {statusLabel(s.status)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-black text-white uppercase tracking-tight truncate" title={tutorName}>
                        {tutorName}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate" title={studentName}>
                        {studentName}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5" title={`${s.block.course.name} — ${s.block.name}`}>
                        {s.block.course.name} · {s.block.name}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!detailModalSession}
        onClose={() => setDetailModalSession(null)}
        title="Detalle de tutoría"
        panelClassName="max-w-5xl"
      >
        {detailModalSession && <TutoringSessionDetailModalContent session={detailModalSession} />}
      </Modal>
    </>
  );
}

function ModalSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-700/70 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-4 sm:p-5 shadow-inner shadow-black/20">
      <h4 className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 border border-slate-600/80 text-slate-300">{icon}</span>
        {title}
      </h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ModalField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <div className="text-sm text-slate-100 leading-snug break-words">{children}</div>
    </div>
  );
}

function TutoringSessionDetailModalContent({ session: s }: { session: AdminTutoringSessionRow }) {
  const tutorName = s.tutor ? `${s.tutor.names} ${s.tutor.last_names}` : '—';
  const studentName = `${s.student.names} ${s.student.last_names}`;

  const iconClock = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  const iconUsers = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
  const iconBook = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
  const iconLink = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
  const iconChart = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  return (
    <div className="space-y-4 text-left -mt-2">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-600/40 bg-slate-900/60 px-4 py-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Estado de la sesión</p>
          <span className={`inline-block text-xs px-3 py-1 rounded-full border font-black uppercase ${statusChipClass(s.status)}`}>
            {statusLabel(s.status)}
          </span>
        </div>
      </div>

      <ModalSection title="Fechas" icon={iconClock}>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-lg bg-slate-950/50 border border-slate-700/60 p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Solicitud</p>
            <p className="text-xs text-slate-200 leading-tight">{formatDateTimeLong(s.requestedAt)}</p>
          </div>
          <div className="rounded-lg bg-slate-950/50 border border-slate-700/60 p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Programada</p>
            <p className="text-xs text-slate-200 leading-tight">{s.scheduledAt ? formatDateTimeLong(s.scheduledAt) : '—'}</p>
          </div>
          <div className="rounded-lg bg-slate-950/50 border border-slate-700/60 p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Ejecutada</p>
            <p className="text-xs text-slate-200 leading-tight">{s.executedAt ? formatDateTimeLong(s.executedAt) : '—'}</p>
          </div>
        </div>
      </ModalSection>

      <ModalSection title="Participantes" icon={iconUsers}>
        <div className="grid sm:grid-cols-2 gap-4">
          <ModalField label="Tutor">
            <span className="font-semibold text-white">{tutorName}</span>
          </ModalField>
          <ModalField label="Estudiante">
            <span className="font-semibold text-white">{studentName}</span>
          </ModalField>
          <div className="sm:col-span-2">
            <ModalField label="Correo del estudiante">
              <a href={`mailto:${s.student.email}`} className="text-sky-400 hover:text-sky-300 underline decoration-sky-500/50">
                {s.student.email}
              </a>
            </ModalField>
          </div>
        </div>
      </ModalSection>

      <ModalSection title="Contenido" icon={iconBook}>
        <ModalField label="Curso y bloque">
          <p>
            <span className="text-slate-300">{s.block.course.name}</span>
            <span className="text-slate-600 mx-2">·</span>
            <span className="text-white font-semibold">{s.block.name}</span>
          </p>
        </ModalField>
        <ModalField label="Intento">
          <span className="inline-flex items-center rounded-md bg-slate-800 px-2.5 py-1 text-xs font-mono font-bold text-slate-200 border border-slate-600">
            #{s.attemptNumber}
          </span>
        </ModalField>
      </ModalSection>

      <ModalSection title="Enlaces" icon={iconLink}>
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-700/80 bg-slate-950/40 p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Reunión</p>
            {s.meetingLink ? (
              <a
                href={s.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-sky-400/95 hover:text-sky-300 break-all underline underline-offset-2 decoration-sky-500/40"
              >
                {s.meetingLink}
              </a>
            ) : (
              <span className="text-slate-500 italic text-sm">Sin enlace</span>
            )}
          </div>
          <div className="rounded-lg border border-slate-700/80 bg-slate-950/40 p-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Grabación</p>
            {s.recordingLink ? (
              <a
                href={s.recordingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-sky-400 hover:text-sky-300 break-all underline underline-offset-2"
              >
                {s.recordingLink}
              </a>
            ) : (
              <span className="text-slate-500 italic text-sm">—</span>
            )}
          </div>
        </div>
      </ModalSection>

      <ModalSection title="Evaluación" icon={iconChart}>
        <div className="grid sm:grid-cols-2 gap-4">
          <ModalField label="Calificación">
            {s.grade != null ? (
              <span className="inline-flex items-baseline gap-1">
                <span className="text-2xl font-black text-white tabular-nums">{s.grade}</span>
                <span className="text-slate-500 text-sm font-bold">/ 10</span>
              </span>
            ) : (
              <span className="text-slate-500 italic">—</span>
            )}
          </ModalField>
          <ModalField label="Valoración al tutor">
            {s.tutorRating != null ? (
              <span className="text-lg font-bold text-amber-400">{s.tutorRating}/5</span>
            ) : (
              <span className="text-slate-500 italic">—</span>
            )}
            {s.tutorFeedback && <p className="text-xs text-slate-400 mt-2 leading-relaxed">{s.tutorFeedback}</p>}
          </ModalField>
        </div>
        <ModalField label="Observaciones">
          {s.observations ? (
            <div className="mt-1 rounded-lg border border-slate-700/50 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {s.observations}
            </div>
          ) : (
            <span className="text-slate-500 italic">—</span>
          )}
        </ModalField>
      </ModalSection>

      {s.cancellationReason && (
        <div className="rounded-xl border border-slate-600/50 bg-slate-900/70 px-4 py-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Motivo de cancelación</p>
          <p className="text-sm text-slate-300 leading-relaxed">{s.cancellationReason}</p>
        </div>
      )}
    </div>
  );
}
