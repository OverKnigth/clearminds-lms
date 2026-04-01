import { useState, useEffect } from 'react';
import { useGenerations } from '../../../hooks/useGenerations';
import { api } from '../../../services/api';
import type { Generation } from '../../../types/generation';
import type { CourseData } from '../types';
import Modal from '../../../components/Modal';
import { GenerationCard } from './GenerationCard';

interface GenerationsTabProps {
  onSelectGeneration: (generation: Generation) => void;
}

const INPUT_CLS =
  'w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500';
const BTN_PRIMARY =
  'px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-black uppercase tracking-widest rounded-lg transition-all';
const BTN_GHOST =
  'px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-black uppercase tracking-widest rounded-lg transition-colors';

const INITIAL_FORM = {
  name: '',
  description: '',
  courseIds: [] as string[],
};

export function GenerationsTab({ onSelectGeneration }: GenerationsTabProps) {
  const { generations, isLoading, createGeneration, updateGeneration } = useGenerations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [availableCourses, setAvailableCourses] = useState<CourseData[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      setCoursesLoading(true);
      api
        .getAdminCourses()
        .then((res) => {
          const data = res?.data ?? res;
          setAvailableCourses(Array.isArray(data) ? data : []);
        })
        .catch(() => setAvailableCourses([]))
        .finally(() => setCoursesLoading(false));
    }
  }, [isModalOpen]);

  const openModal = () => {
    setForm(INITIAL_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  const toggleCourse = (id: string) => {
    setForm((f) => ({
      ...f,
      courseIds: f.courseIds.includes(id)
        ? f.courseIds.filter((c) => c !== id)
        : [...f.courseIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    setSaving(true);
    try {
      await createGeneration({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        courseIds: form.courseIds.length > 0 ? form.courseIds : undefined,
      });
      setIsModalOpen(false);
    } catch (err: any) {
      const status = err?.status;
      if (status === 409) {
        setFormError('Ya existe una generación con ese nombre.');
      } else if (status === 400) {
        setFormError(err?.message ?? 'Datos inválidos. Revisa los campos.');
      } else {
        setFormError('Error al crear la generación. Intenta de nuevo.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-slate-800 border border-slate-700/50 rounded-2xl px-6 py-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            Gestión de Cursos
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            Generaciones y cohortes académicas
          </p>
        </div>
        <button onClick={openModal} className={BTN_PRIMARY}>
          + Nueva Generación
        </button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : generations.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-700 rounded-2xl text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-4 border border-slate-700">
            🎓
          </div>
          <p className="text-white font-black text-lg uppercase tracking-tighter mb-1">
            Sin generaciones
          </p>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">
            Crea la primera generación para organizar tus cohortes
          </p>
          <button onClick={openModal} className={BTN_PRIMARY}>
            Crear generación
          </button>
        </div>
      ) : (
        /* Generation list — GenerationCard will be rendered here (task 8) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generations.map((generation) => (
            <GenerationCard
              key={generation.id}
              generation={generation}
              onClick={() => onSelectGeneration(generation)}
              onUpdate={updateGeneration}
            />
          ))}
        </div>
      )}

      {/* Create Generation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva Generación"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Nombre *
            </label>
            <input
              required
              className={INPUT_CLS}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Generación 2026-A"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Descripción
            </label>
            <textarea
              rows={2}
              className={INPUT_CLS + ' resize-none'}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Descripción opcional de la generación"
            />
          </div>

          {/* Course multi-select */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Cursos iniciales{' '}
              <span className="text-slate-600 normal-case font-medium">(opcional)</span>
            </label>
            {coursesLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
              </div>
            ) : availableCourses.length === 0 ? (
              <div className="p-4 bg-slate-900/60 border border-dashed border-slate-700 rounded-xl text-center">
                <p className="text-[10px] text-slate-500 uppercase font-black">
                  No hay cursos disponibles
                </p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1">
                {availableCourses.map((course) => {
                  const selected = form.courseIds.includes(course.id);
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
                        <span className="text-[9px] font-black text-red-400 uppercase shrink-0">
                          ✓
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
            {form.courseIds.length > 0 && (
              <p className="text-[9px] text-red-400 font-black uppercase tracking-widest mt-1">
                {form.courseIds.length} curso{form.courseIds.length !== 1 ? 's' : ''} seleccionado
                {form.courseIds.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Inline error */}
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-xs text-red-400 font-bold">{formError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={BTN_GHOST + ' flex-1 text-[10px]'}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className={BTN_PRIMARY + ' flex-1 text-[10px] disabled:opacity-50 flex items-center justify-center gap-2'}
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                'Crear Generación'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

