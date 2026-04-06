import { useState, useEffect, useMemo } from 'react';
import { useParallelDetail } from '@/shared/hooks/useParallelDetail';
import { api } from '@/shared/services/api';
import type { Parallel } from '@/shared/types/group';

interface ParallelDetailViewProps {
  parallel: Parallel;
  groupId: string;
  onBack: () => void;
}

interface UserRecord {
  id: string;
  names?: string;
  lastNames?: string;
  email: string;
  role?: string;
  status?: string;
}

const INPUT_CLS =
  'w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500';
const BTN_PRIMARY =
  'px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-black uppercase tracking-widest rounded-lg transition-all';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function getUserFullName(user: UserRecord): string {
  const parts = [user.names, user.lastNames].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : user.email;
}

export function ParallelDetailView({ parallel, onBack }: ParallelDetailViewProps) {
  const { students, isLoading, enrollStudents } = useParallelDetail(parallel.id);

  // ── Assignment panel state ─────────────────────────────────────────────────
  const [allStudents, setAllStudents] = useState<UserRecord[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  // Load all active students once
  useEffect(() => {
    setStudentsLoading(true);
    api
      .getAllUsers('student', 1, 500)
      .then((res: any) => {
        const data = res?.data ?? res;
        const list: UserRecord[] = Array.isArray(data) ? data : (data?.users ?? []);
        setAllStudents(list.filter((u) => !u.status || u.status === 'active'));
      })
      .catch(() => setAllStudents([]))
      .finally(() => setStudentsLoading(false));
  }, []);

  // Set of already-enrolled student ids for quick lookup
  const enrolledIds = useMemo(() => new Set(students.map((s) => s.id)), [students]);

  // Students not yet enrolled, filtered by search
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allStudents.filter((u) => {
      const fullName = getUserFullName(u).toLowerCase();
      const matchesSearch = !q || fullName.includes(q) || u.email.toLowerCase().includes(q);
      return matchesSearch;
    });
  }, [allStudents, searchQuery]);

  const toggleSelect = (id: string) => {
    if (enrolledIds.has(id)) return; // already enrolled, can't toggle
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleEnroll = async () => {
    if (selectedIds.length === 0) return;
    setEnrolling(true);
    setEnrollError(null);
    try {
      await enrollStudents(selectedIds);
      setSelectedIds([]);
    } catch (err: any) {
      setEnrollError(err?.message ?? 'Error al inscribir estudiantes. Intenta de nuevo.');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 bg-slate-800 border border-slate-700/50 rounded-lg px-6 py-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 flex-shrink-0"
          aria-label="Volver"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            {parallel.name}
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            {parallel.studentCount} estudiante{parallel.studentCount !== 1 ? 's' : ''} inscritos
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Enrolled Students ──────────────────────────────────────────── */}
          <section>
            <div className="mb-5">
              <h3 className="text-base font-black text-white uppercase tracking-tighter">
                Estudiantes inscritos
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                Estudiantes actualmente en este paralelo
              </p>
            </div>

            {students.length === 0 ? (
              /* Empty state — Req. 11.2 */
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-700 rounded-2xl text-center">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl mb-3 border border-slate-700">
                  🎓
                </div>
                <p className="text-white font-black text-sm uppercase tracking-tighter mb-1">
                  Sin estudiantes inscritos
                </p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  Asigna estudiantes desde el panel de la derecha
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 bg-slate-800 px-4 py-3 rounded-xl border border-slate-700"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-black text-red-400 uppercase">
                        {student.fullName.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-white uppercase tracking-tighter truncate">
                        {student.fullName}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{student.email}</p>
                    </div>
                    <span className="text-[9px] text-slate-600 font-bold uppercase shrink-0">
                      {formatDate(student.enrolledAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Assignment Panel ───────────────────────────────────────────── */}
          <section>
            <div className="mb-5">
              <h3 className="text-base font-black text-white uppercase tracking-tighter">
                Asignar estudiantes
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                Busca y selecciona estudiantes para inscribir
              </p>
            </div>

            {/* Search input — Req. 7.1 */}
            <div className="mb-4">
              <input
                type="text"
                className={INPUT_CLS}
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {studentsLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-6 bg-slate-900/60 border border-dashed border-slate-700 rounded-xl text-center">
                <p className="text-[10px] text-slate-500 uppercase font-black">
                  {searchQuery ? 'Sin resultados para la búsqueda' : 'No hay estudiantes activos'}
                </p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 max-h-80 overflow-y-auto space-y-1 mb-4">
                {filteredStudents.map((user) => {
                  const alreadyEnrolled = enrolledIds.has(user.id);
                  const selected = selectedIds.includes(user.id);
                  const fullName = getUserFullName(user);

                  return (
                    <label
                      key={user.id}
                      className={[
                        'flex items-center gap-3 p-2 rounded-lg transition-colors',
                        alreadyEnrolled
                          ? 'bg-green-900/20 border border-green-700/30 cursor-default'
                          : 'bg-slate-800/50 hover:bg-slate-800 cursor-pointer',
                      ].join(' ')}
                    >
                      {/* Checkbox — only for non-enrolled students */}
                      {alreadyEnrolled ? (
                        <span className="w-4 h-4 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      ) : (
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-red-600 focus:ring-red-500 shrink-0"
                          checked={selected}
                          onChange={() => toggleSelect(user.id)}
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-white uppercase truncate">
                          {fullName}
                        </p>
                        <p className="text-[9px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      {/* Visual badge for already enrolled — Req. 7.4 */}
                      {alreadyEnrolled && (
                        <span className="text-[9px] font-black text-green-400 uppercase shrink-0 bg-green-900/30 px-1.5 py-0.5 rounded">
                          Inscrito
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {selectedIds.length > 0 && (
              <p className="text-[9px] text-red-400 font-black uppercase tracking-widest mb-3">
                {selectedIds.length} estudiante{selectedIds.length !== 1 ? 's' : ''} seleccionado
                {selectedIds.length !== 1 ? 's' : ''}
              </p>
            )}

            {enrollError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-3">
                <p className="text-xs text-red-400 font-bold">{enrollError}</p>
              </div>
            )}

            {/* Assign button — Req. 7.5 */}
            <button
              type="button"
              disabled={enrolling || selectedIds.length === 0}
              onClick={handleEnroll}
              className={BTN_PRIMARY + ' w-full text-[10px] disabled:opacity-50 flex items-center justify-center gap-2'}
            >
              {enrolling ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Asignando...
                </>
              ) : (
                'Asignar seleccionados'
              )}
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
