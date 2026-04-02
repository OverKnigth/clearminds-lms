import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import Modal from '../../../components/Modal';

interface Badge {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  icon: string | null;
  category: string;
  courseId?: string | null;
  course?: { name: string };
}

const INPUT_CLS = 'w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all';
const LABEL_CLS = 'block text-sm font-medium text-slate-300 mb-1.5';
const BTN_PRIMARY = 'px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20';

export function BadgesTab() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [courseBlocks, setCourseBlocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    courseId: '',
    blockIds: [] as string[],
    category: 'academic',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [badgesRes, coursesRes] = await Promise.all([
        api.getBadges(),
        api.getAdminCourses()
      ]);
      
      if (badgesRes.success) setBadges(badgesRes.data.map((b: any) => ({
        ...b,
        imageUrl: b.imageUrl ?? b.image_url ?? null,
        courseId: b.courseId ?? b.course_id ?? null,
        blockId: b.blockId ?? b.block_id ?? null,
        blockIds: b.blockIds ?? (b.block_id ? [b.block_id] : []),
      })));
      if (coursesRes.success) setCourses(coursesRes.data);
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseChange = async (courseId: string) => {
    setForm(f => ({ ...f, courseId, blockIds: [] }));
    setCourseBlocks([]);
    if (!courseId) return;
    try {
      // Load blocks for the course
      const courseRes = await api.getCourseDetail(courseId);
      if (courseRes.success) {
        const rawBlocks = courseRes.data.blocks || [];
        setCourseBlocks(rawBlocks.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)));
      }
    } catch (e) {
      console.error('Error loading course data:', e);
    }
  };

  const handleOpenModal = async (badge?: Badge) => {
    if (badge) {
      setForm({
        name: badge.name,
        description: badge.description || '',
        imageUrl: badge.imageUrl || '',
        courseId: badge.courseId || '',
        blockIds: (badge as any).blockIds || ((badge as any).blockId ? [(badge as any).blockId] : []),
        category: badge.category,
      });
      if (badge.courseId) {
        const courseRes = await api.getCourseDetail(badge.courseId);
        if (courseRes.success) setCourseBlocks((courseRes.data.blocks || []).sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)));
      }
      setEditingBadge(badge);
    } else {
      setForm({ name: '', description: '', imageUrl: '', courseId: '', blockIds: [], category: 'academic' });
      setCourseBlocks([]);
      setEditingBadge(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBadge) {
        await api.updateBadge(editingBadge.id, form);
      } else {
        await api.createBadge(form);
      }      setIsModalOpen(false);
      loadInitialData();
    } catch (e: any) {
      alert(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta insignia?')) {
      try {
        await api.deleteBadge(id);
        loadInitialData();
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 bg-slate-800 border border-slate-700/50 rounded-lg px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Centro de Insignias</h2>
          <p className="text-sm text-slate-400 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Configura los gráficos y reglas de obtención de insignias
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className={BTN_PRIMARY}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Crear Insignia
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-12 h-12 border-4 border-red-500/10 border-t-red-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm animate-pulse">Cargando catálogo...</p>
        </div>
      ) : badges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-20 h-20 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center text-4xl">
            🏅
          </div>
          <p className="text-white font-black text-lg uppercase tracking-tighter">Sin insignias creadas</p>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Crea tu primera insignia usando el botón de arriba</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map(badge => (
            <div key={badge.id} className="bg-slate-800 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-all overflow-hidden">
              {/* Image */}
              <div className="w-full h-40 bg-slate-700/30 flex items-center justify-center overflow-hidden">
                {badge.imageUrl ? (
                  <img src={badge.imageUrl} alt={badge.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">{badge.icon || '🏆'}</span>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-sm font-black text-white uppercase tracking-tighter mb-1">{badge.name}</h3>
                {badge.description && (
                  <p className="text-[10px] text-slate-500 line-clamp-2 mb-2">{badge.description}</p>
                )}
                {badge.course?.name && (
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    Curso: {badge.course.name}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex border-t border-slate-700/50">
                <button
                  onClick={() => handleOpenModal(badge)}
                  className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
                <div className="w-px bg-slate-700/50" />
                <button
                  onClick={() => handleDelete(badge.id)}
                  className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-500/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBadge ? 'Configurar Insignia' : 'Nueva Insignia Pro'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className={LABEL_CLS}>Nombre de la insignia *</label>
                <input required className={INPUT_CLS} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: JavaScript Fundamentals - Pro" />
              </div>

              <div>
                <label className={LABEL_CLS}>URL del Gráfico / Imagen *</label>
                <input required className={INPUT_CLS} value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
                <p className="text-[10px] text-slate-500 mt-1">Se recomienda PNG transparente 512x512</p>
              </div>

              <div>
                <label className={LABEL_CLS}>Descripción comercial</label>
                <textarea rows={3} className={INPUT_CLS} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Escribe un texto motivacional..." />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={LABEL_CLS}>Curso asociado</label>
                <select className={INPUT_CLS} value={form.courseId} onChange={e => handleCourseChange(e.target.value)}>
                  <option value="">Selecciona un curso</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className={LABEL_CLS}>Bloques de activación</label>
                {!form.courseId ? (
                  <p className="text-[10px] text-slate-500 italic py-2">Selecciona un curso primero.</p>
                ) : courseBlocks.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic py-2">Este curso no tiene bloques definidos.</p>
                ) : (
                  <div className="bg-slate-700/30 border border-slate-600 rounded-lg divide-y divide-slate-700/50 max-h-44 overflow-y-auto scrollbar-none">
                    {courseBlocks.map((b: any) => {
                      const selected = form.blockIds.includes(b.id);
                      return (
                        <label key={b.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-slate-700/40 transition-colors">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => {
                              const ids = selected
                                ? form.blockIds.filter(id => id !== b.id)
                                : [...form.blockIds, b.id];
                              setForm(f => ({ ...f, blockIds: ids }));
                            }}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-red-600 focus:ring-red-500 focus:ring-offset-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white uppercase tracking-tighter truncate">
                              {b.order ? `${b.order}. ` : ''}{b.name}
                            </p>
                          </div>
                          {selected && <span className="text-[9px] font-black text-red-400 shrink-0">✓</span>}
                        </label>
                      );
                    })}
                  </div>
                )}
                <p className="text-[10px] text-slate-500 mt-1">
                  {form.blockIds.length === 0
                    ? 'Sin selección: aplica a todo el curso.'
                    : `${form.blockIds.length} bloque${form.blockIds.length !== 1 ? 's' : ''} seleccionado${form.blockIds.length !== 1 ? 's' : ''}.`}
                </p>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700">
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-2">Previsualización</span>
                <div className="flex justify-center">
                  <div className="w-32 h-32 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
                    {form.imageUrl ? (
                      <img src={form.imageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">🏅</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className={`flex-1 ${BTN_PRIMARY} disabled:opacity-50`}>
              {saving ? 'Procesando...' : editingBadge ? 'Guardar Cambios' : 'Activar Insignia'}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors">Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
