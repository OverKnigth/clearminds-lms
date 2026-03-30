import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import type { CourseData } from '../types';
import Modal from '../../../components/Modal';

interface AcademicBlock {
  id: string;
  courseId: string;
  name: string;
  order: number;
  expectedProgress: number;
  mandatoryTutoring: boolean;
  minPassGrade: number;
  badgeId: string | null;
}

interface AcademicBlocksTabProps {
  course: CourseData;
  onBack: () => void;
}

const INPUT_CLS = 'w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500';
const BTN_PRIMARY = 'px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-medium rounded-lg transition-all';
const BTN_GHOST = 'px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors';

export function AcademicBlocksTab({ course, onBack }: AcademicBlocksTabProps) {
  const [blocks, setBlocks] = useState<AcademicBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<AcademicBlock | null>(null);
  const [saving, setSaving] = useState(false);
  const [badgeCatalog, setBadgeCatalog] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: '',
    order: 1,
    expectedProgress: 100,
    mandatoryTutoring: true,
    minPassGrade: 7,
    badgeId: '',
  });

  useEffect(() => {
    loadBlocks();
    loadBadges();
  }, [course.id]);

  const loadBadges = async () => {
    try {
      const res = await api.getBadges();
      if (res.success) setBadgeCatalog(res.data);
    } catch (e) { console.error(e); }
  };

  const loadBlocks = async () => {
    setIsLoading(true);
    try {
      // Usamos el endpoint de admin de cursos que ya nos trae los bloques en el detail
      const res = await api.getCourseDetail(course.id);
      if (res.success) {
        setBlocks(res.data.blocks || []);
      }
    } catch (e) {
      console.error('Error loading blocks:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (block?: AcademicBlock) => {
    if (block) {
      setForm({
        name: block.name,
        order: block.order,
        expectedProgress: block.expectedProgress,
        mandatoryTutoring: block.mandatoryTutoring,
        minPassGrade: block.minPassGrade,
        badgeId: block.badgeId || '',
      });
      setEditingBlock(block);
    } else {
      setForm({
        name: '',
        order: blocks.length + 1,
        expectedProgress: 100,
        mandatoryTutoring: true,
        minPassGrade: 7,
        badgeId: '',
      });
      setEditingBlock(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBlock) {
        await api.updateCourse(course.id, {
          blocks: blocks.map(b => b.id === editingBlock.id ? { ...b, ...form } : b)
        });
      } else {
        const newBlock = { ...form, id: Math.random().toString(36).substr(2, 9) };
        await api.updateCourse(course.id, {
          blocks: [...blocks, newBlock]
        });
      }
      setIsModalOpen(false);
      await loadBlocks();
    } catch (e: any) {
      alert(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este bloque? Los temas asociados quedarán sin bloque.')) return;
    try {
      await api.updateCourse(course.id, {
        blocks: blocks.filter(b => b.id !== id)
      });
      await loadBlocks();
    } catch (e: any) {
      alert(e.response?.data?.message || e.message);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-white">Bloques Académicos</h2>
          <p className="text-sm text-slate-400">Configura las metas y tutorías de {course.name}</p>
        </div>
        <button onClick={() => handleOpenModal()} className={BTN_PRIMARY}>
          Nuevo Bloque
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : blocks.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-xl">
          <p className="text-slate-400">No hay bloques definidos para este curso.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blocks.sort((a, b) => a.order - b.order).map(block => (
            <div key={block.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{block.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {block.id}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(block)} className="p-2 hover:bg-slate-700 rounded-lg text-yellow-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(block.id)} className="p-2 hover:bg-slate-700 rounded-lg text-red-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Progreso esperado:</span>
                  <span className="text-white font-medium">{block.expectedProgress}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nota mínima:</span>
                  <span className="text-white font-medium">{block.minPassGrade}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tutoría obligatoria:</span>
                  <span className={block.mandatoryTutoring ? 'text-green-400 font-medium' : 'text-slate-500 font-medium'}>
                    {block.mandatoryTutoring ? 'SÍ' : 'NO'}
                  </span>
                </div>
                {block.badgeId && (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-700/50 mt-2">
                    <span className="text-slate-400">Insignia:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{badgeCatalog.find(b => b.id === block.badgeId)?.icon || '🏆'}</span>
                      <span className="text-white text-xs font-medium">{badgeCatalog.find(b => b.id === block.badgeId)?.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBlock ? 'Editar Bloque' : 'Nuevo Bloque'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre del bloque *</label>
            <input required className={INPUT_CLS} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Fundamentos de Web" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Orden *</label>
              <input type="number" required className={INPUT_CLS} value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nota mínima *</label>
              <input type="number" step={0.5} min={0} max={10} required className={INPUT_CLS} value={form.minPassGrade} onChange={e => setForm(f => ({ ...f, minPassGrade: Number(e.target.value) }))} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Progreso esperado para tutoría (%) *</label>
            <div className="flex items-center gap-4">
              <input type="range" min={0} max={100} step={5} className="flex-1 accent-red-600" value={form.expectedProgress} onChange={e => setForm(f => ({ ...f, expectedProgress: Number(e.target.value) }))} />
              <span className="w-12 text-center text-white font-bold">{form.expectedProgress}%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Insignia por completar el bloque</label>
            <select className={INPUT_CLS + ' appearance-none'} value={form.badgeId} onChange={e => setForm(f => ({ ...f, badgeId: e.target.value }))}>
              <option value="">Ninguna</option>
              {badgeCatalog.map(badge => (
                <option key={badge.id} value={badge.id}>{badge.icon} {badge.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600">
            <div>
              <p className="text-sm font-medium text-white">Tutoría Obligatoria</p>
              <p className="text-xs text-slate-400">¿Debe aprobar la tutoría para avanzar?</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, mandatoryTutoring: !f.mandatoryTutoring }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.mandatoryTutoring ? 'bg-red-600' : 'bg-slate-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.mandatoryTutoring ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className={`flex-1 py-2.5 ${BTN_PRIMARY} disabled:opacity-50`}>
              {saving ? 'Guardando...' : editingBlock ? 'Guardar cambios' : 'Crear bloque'}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className={BTN_GHOST}>Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
