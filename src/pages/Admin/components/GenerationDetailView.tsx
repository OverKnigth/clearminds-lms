import { useState, useEffect } from 'react';
import { useGenerationDetail } from '../../../hooks/useGenerationDetail';
import { api } from '../../../services/api';
import type { Generation, Parallel } from '../../../types/generation';
import type { CourseData } from '../types';
import Modal from '../../../components/Modal';

interface GenerationDetailViewProps {
  generation: Generation;
  onBack: () => void;
  onManageBlocks: (course: CourseData) => void;
  onSelectParallel: (parallel: Parallel) => void;
}

const INPUT_CLS =
  'w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500';
const BTN_PRIMARY =
  'px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-black uppercase tracking-widest rounded-lg transition-all';
const BTN_GHOST =
  'px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-black uppercase tracking-widest rounded-lg transition-colors';

export function GenerationDetailView({
  generation,
  onBack,
  onManageBlocks,
  onSelectParallel,
}: GenerationDetailViewProps) {
  const { detail, isLoading, addCourses, createParallel } = useGenerationDetail(generation.id);

  // ── Add Courses Modal ──────────────────────────────────────────────────────
  const [isAddCoursesOpen, setIsAddCoursesOpen] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<CourseData[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [addingCourses, setAddingCourses] = useState(false);
  const [addCoursesError, setAddCoursesError] = useState<string | null>(null);

  // ── Create Parallel Modal ──────────────────────────────────────────────────
  const [isCreateParallelOpen, setIsCreateParallelOpen] = useState(false);
  const [parallelName, setParallelName] = useState('');
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [creatingParallel, setCreatingParallel] = useState(false);
  const [parallelError, setParallelError] = useState<string | null>(null);

  // Collect all blocks from assigned courses
  const allBlocks = (detail?.courses ?? []).flatMap((c) =>
    (c.course.blocks ?? []).map((b: any) => ({ ...b, courseName: c.course.name }))
  );

  // Load all courses when modal opens, then filter out already-assigned ones
  useEffect(() => {
    if (!isAddCoursesOpen) return;
    setCoursesLoading(true);
    setSelectedCourseIds([]);
    setAddCoursesError(null);
    api
      .getAdminCourses()
      .then((res) => {
        const all: CourseData[] = Array.isArray(res) ? res : (res?.data ?? []);
        const assignedIds = new Set((detail?.courses ?? []).map((c) => c.course.id));
        setAvailableCourses(all.filter((c) => !assignedIds.has(c.id)));
      })
      .catch(() => setAvailableCourses([]))
      .finally(() => setCoursesLoading(false));
  }, [isAddCoursesOpen, detail?.courses]);

  const toggleCourse = (id: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleAddCourses = async () => {
    if (selectedCourseIds.length === 0) return;
    setAddingCourses(true);
    setAddCoursesError(null);
    try {
      await addCourses(selectedCourseIds);
      setIsAddCoursesOpen(false);
    } catch (err: any) {
      setAddCoursesError(err?.message ?? 'Error al agregar cursos. Intenta de nuevo.');
    } finally {
      setAddingCourses(false);
    }
  };

  const handleCreateParallel = async (e: React.FormEvent) => {
    e.preventDefault();
    setParallelError(null);
    const name = parallelName.trim();
    if (!name) return;
    setCreatingParallel(true);
    try {
      await createParallel(name);
      setIsCreateParallelOpen(false);
      setParallelName('');
    } catch (err: any) {
      const status = err?.status;
      if (status === 409) {
        setParallelError('Ya existe un paralelo con ese nombre en esta generación.');
      } else {
        setParallelError(err?.message ?? 'Error al crear el paralelo. Intenta de nuevo.');
      }
    } finally {
      setCreatingParallel(false);
    }
  };

  const openCreateParallel = () => {
    setParallelName('');
    setSelectedBlockIds([]);
    setParallelError(null);
    setIsCreateParallelOpen(true);
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          aria-label="Volver"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">
            {generation.name}
          </h2>
          {generation.description && (
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              {generation.description}
            </p>
          )}
        </div>
        <button onClick={onBack} className={BTN_GHOST + ' ml-auto text-[10px]'}>
          ← Volver
        </button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-10">
          {/* ── Courses Section ─────────────────────────────────────────── */}
          <section>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tighter">
                  Cursos
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                  Cursos asignados a esta generación
                </p>
              </div>
              <button
                onClick={() => setIsAddCoursesOpen(true)}
                className={BTN_PRIMARY + ' text-[10px]'}
              >
                + Agregar cursos
              </button>
            </div>

            {detail?.courses.length === 0 ? (
              /* Empty state — Req. 11.5 */
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-700 rounded-2xl text-center">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl mb-3 border border-slate-700">
                  📚
                </div>
                <p className="text-white font-black text-sm uppercase tracking-tighter mb-1">
                  Sin cursos asignados
                </p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-5">
                  Agrega cursos para definir el plan académico de esta generación
                </p>
                <button
                  onClick={() => setIsAddCoursesOpen(true)}
                  className={BTN_PRIMARY + ' text-[10px]'}
                >
                  Agregar cursos
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {detail?.courses.map(({ offeringId, course }) => (
                  <div
                    key={offeringId}
                    className="flex items-center justify-between bg-slate-800 px-5 py-4 rounded-xl border border-slate-700"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-white uppercase tracking-tighter truncate">
                        {course.name}
                      </p>
                      {course.description && (
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {course.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onManageBlocks(course)}
                      className="ml-4 shrink-0 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white rounded-lg transition-colors"
                    >
                      Gestionar bloques
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Parallels Section ───────────────────────────────────────── */}
          <section>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tighter">
                  Paralelos
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                  Grupos de estudiantes de esta generación
                </p>
              </div>
              <button onClick={openCreateParallel} className={BTN_PRIMARY + ' text-[10px]'}>
                + Crear paralelo
              </button>
            </div>

            {detail?.parallels.length === 0 ? (
              /* Empty state — Req. 11.6 */
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-700 rounded-2xl text-center">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl mb-3 border border-slate-700">
                  👥
                </div>
                <p className="text-white font-black text-sm uppercase tracking-tighter mb-1">
                  Sin paralelos
                </p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-5">
                  Crea el primer paralelo para organizar los grupos de estudiantes
                </p>
                <button onClick={openCreateParallel} className={BTN_PRIMARY + ' text-[10px]'}>
                  Crear paralelo
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {detail?.parallels.map((parallel) => (
                  <div
                    key={parallel.id}
                    className="flex items-center justify-between bg-slate-800 px-5 py-4 rounded-xl border border-slate-700"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-white uppercase tracking-tighter truncate">
                        {parallel.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                        {parallel.studentCount} estudiante{parallel.studentCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => onSelectParallel(parallel)}
                      className="ml-4 shrink-0 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white rounded-lg transition-colors"
                    >
                      Ver paralelo
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ── Add Courses Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={isAddCoursesOpen}
        onClose={() => setIsAddCoursesOpen(false)}
        title="Agregar Cursos"
      >
        <div className="space-y-5">
          <p className="text-xs text-slate-400">
            Selecciona los cursos que deseas agregar a esta generación. Solo se muestran los cursos
            que aún no están asignados.
          </p>

          {coursesLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
            </div>
          ) : availableCourses.length === 0 ? (
            <div className="p-6 bg-slate-900/60 border border-dashed border-slate-700 rounded-xl text-center">
              <p className="text-[10px] text-slate-500 uppercase font-black">
                No hay cursos disponibles para agregar
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 max-h-64 overflow-y-auto space-y-1">
              {availableCourses.map((course) => {
                const selected = selectedCourseIds.includes(course.id);
                return (
                  <label
                    key={course.id}
                    className="flex items-center gap-3 p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-red-600 focus:ring-red-500"
                      checked={selected}
                      onChange={() => toggleCourse(course.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-white uppercase truncate">
                        {course.name}
                      </p>
                      {course.description && (
                        <p className="text-[9px] text-slate-500 truncate">{course.description}</p>
                      )}
                    </div>
                    {selected && (
                      <span className="text-[9px] font-black text-red-400 uppercase shrink-0">✓</span>
                    )}
                  </label>
                );
              })}
            </div>
          )}

          {selectedCourseIds.length > 0 && (
            <p className="text-[9px] text-red-400 font-black uppercase tracking-widest">
              {selectedCourseIds.length} curso{selectedCourseIds.length !== 1 ? 's' : ''}{' '}
              seleccionado{selectedCourseIds.length !== 1 ? 's' : ''}
            </p>
          )}

          {addCoursesError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-xs text-red-400 font-bold">{addCoursesError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddCoursesOpen(false)}
              className={BTN_GHOST + ' flex-1 text-[10px]'}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={addingCourses || selectedCourseIds.length === 0}
              onClick={handleAddCourses}
              className={BTN_PRIMARY + ' flex-1 text-[10px] disabled:opacity-50 flex items-center justify-center gap-2'}
            >
              {addingCourses ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Agregando...
                </>
              ) : (
                'Agregar cursos'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Create Parallel Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={isCreateParallelOpen}
        onClose={() => setIsCreateParallelOpen(false)}
        title="Crear Paralelo"
      >
        <form onSubmit={handleCreateParallel} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Nombre del paralelo *
            </label>
            <input
              required
              autoFocus
              className={INPUT_CLS}
              value={parallelName}
              onChange={(e) => setParallelName(e.target.value)}
              placeholder="Ej: Paralelo A"
            />
          </div>

          {/* Blocks selector */}
          {allBlocks.length > 0 && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Bloques del paralelo{' '}
                <span className="text-slate-600 normal-case font-medium">(opcional)</span>
              </label>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 max-h-52 overflow-y-auto space-y-1">
                {allBlocks.map((block: any) => {
                  const selected = selectedBlockIds.includes(block.id);
                  return (
                    <button
                      key={block.id}
                      type="button"
                      onClick={() =>
                        setSelectedBlockIds((prev) =>
                          prev.includes(block.id)
                            ? prev.filter((id) => id !== block.id)
                            : [...prev, block.id]
                        )
                      }
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                        selected
                          ? 'bg-red-600/15 border-red-500/50'
                          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 transition-colors ${
                          selected ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {selected ? '✓' : block.order ?? '·'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[10px] font-black uppercase tracking-tighter truncate ${selected ? 'text-white' : 'text-slate-300'}`}>
                          {block.name}
                        </p>
                        <p className="text-[9px] text-slate-500 uppercase font-bold truncate">
                          {block.courseName}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedBlockIds.length > 0 && (
                <p className="text-[9px] text-red-400 font-black uppercase tracking-widest mt-1">
                  {selectedBlockIds.length} bloque{selectedBlockIds.length !== 1 ? 's' : ''} seleccionado{selectedBlockIds.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {parallelError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-xs text-red-400 font-bold">{parallelError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateParallelOpen(false)}
              className={BTN_GHOST + ' flex-1 text-[10px]'}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creatingParallel}
              className={BTN_PRIMARY + ' flex-1 text-[10px] disabled:opacity-50 flex items-center justify-center gap-2'}
            >
              {creatingParallel ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear paralelo'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
