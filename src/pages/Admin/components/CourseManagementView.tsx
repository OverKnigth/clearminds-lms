import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import type { CourseData } from '../types';
import Modal from '../../../components/Modal';
import { ConfirmDialog } from '../../../components/ConfirmDialog';

interface AcademicBlock {
  id: string;
  name: string;
  order: number;
  expectedProgress: number;
  mandatoryTutoring: boolean;
  minPassGrade: number;
  badgeId: string | null;
}

interface Topic {
  id: string;
  title: string;
  order: number;
  blockId: string | null;
}

interface Offering {
  id: string;
  group: { id: string; name: string };
  tutor?: { names: string; lastNames: string };
  status: string;
}

interface CourseManagementViewProps {
  course: CourseData;
  onBack: () => void;
  hideParallelsTab?: boolean;
}

const INPUT_CLS = 'w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500';
const BTN_PRIMARY = 'px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-black uppercase tracking-widest rounded-lg transition-all';
const BTN_GHOST = 'px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-black uppercase tracking-widest rounded-lg transition-colors';

export function CourseManagementView({ course, onBack, hideParallelsTab }: CourseManagementViewProps) {
  const [subTab, setSubTab] = useState<'blocks' | 'parallels'>('blocks');

  // If parallels tab is hidden and currently active, switch to blocks
  useEffect(() => {
    if (hideParallelsTab && subTab === 'parallels') {
      setSubTab('blocks');
    }
  }, [hideParallelsTab, subTab]);

  // ── Blocks state ──────────────────────────────────────────────────────────
  const [blocks, setBlocks] = useState<AcademicBlock[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [blocksLoading, setBlocksLoading] = useState(true);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<AcademicBlock | null>(null);
  const [savingBlock, setSavingBlock] = useState(false);
  const [blockForm, setBlockForm] = useState({
    name: '', order: 1, expectedProgress: 100,
    mandatoryTutoring: true, minPassGrade: 7, selectedTopicIds: [] as string[]
  });

  // ── Parallels state ───────────────────────────────────────────────────────
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [allGroups, setAllGroups] = useState<{ id: string; name: string }[]>([]);
  const [parallelsLoading, setParallelsLoading] = useState(true);
  const [isParallelModalOpen, setIsParallelModalOpen] = useState(false);
  const [savingParallel, setSavingParallel] = useState(false);
  const [parallelForm, setParallelForm] = useState({ groupId: '', newGroupName: '', cohort: '', mode: 'existing' as 'existing' | 'new', selectedBlockIds: [] as string[] });

  // ── Confirm dialog state ──────────────────────────────────────────────────
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => { loadBlocks(); }, [course.id]);
  useEffect(() => { if (subTab === 'parallels') loadParallels(); }, [subTab, course.id]);

  // ── Blocks logic ──────────────────────────────────────────────────────────
  const loadBlocks = async () => {
    setBlocksLoading(true);
    try {
      const [detailRes, topicsRes] = await Promise.all([
        api.getCourseDetail(course.id),
        api.getCourseTopics(course.id)
      ]);
      if (detailRes.success) setBlocks(detailRes.data.blocks || []);
      if (topicsRes.success) setTopics(topicsRes.data || []);
    } catch (e) { console.error(e); }
    finally { setBlocksLoading(false); }
  };

  const openBlockModal = (block?: AcademicBlock) => {
    if (block) {
      setEditingBlock(block);
      setBlockForm({
        name: block.name, order: block.order,
        expectedProgress: block.expectedProgress,
        mandatoryTutoring: block.mandatoryTutoring,
        minPassGrade: block.minPassGrade,
        selectedTopicIds: topics.filter(t => t.blockId === block.id).map(t => t.id)
      });
    } else {
      setEditingBlock(null);
      setBlockForm({ name: '', order: blocks.length + 1, expectedProgress: 100, mandatoryTutoring: true, minPassGrade: 7, selectedTopicIds: [] });
    }
    setIsBlockModalOpen(true);
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBlock(true);
    try {
      const payload = { name: blockForm.name, order: blockForm.order, expectedProgress: blockForm.expectedProgress, mandatoryTutoring: blockForm.mandatoryTutoring, minPassGrade: blockForm.minPassGrade };
      let blockId: string;
      if (editingBlock) {
        await api.updateBlock(editingBlock.id, payload);
        blockId = editingBlock.id;
      } else {
        const res = await api.createBlock(course.id, payload);
        if (!res.success) throw new Error(res.message || 'Error al crear bloque');
        blockId = res.data?.id || res.data?.block?.id;
        if (!blockId) throw new Error('No se recibió ID del bloque');
      }
      // Sync topic links
      const oldTopics = topics.filter(t => t.blockId === (editingBlock?.id ?? blockId));
      for (const t of oldTopics) {
        if (!blockForm.selectedTopicIds.includes(t.id)) await api.unlinkTopicFromBlock(t.id);
      }
      for (const id of blockForm.selectedTopicIds) {
        const topic = topics.find(t => t.id === id);
        if (!topic || topic.blockId !== blockId) await api.linkTopicToBlock(id, blockId);
      }
      setIsBlockModalOpen(false);
      await loadBlocks();
    } catch (e: any) {
      setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} });
      // show inline — re-open modal with error is complex, use a simple toast-style approach
      alert(e.response?.data?.message || e.message);
    } finally { setSavingBlock(false); }
  };

  const handleDeleteBlock = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar bloque',
      message: '¿Eliminar este bloque y desvincular sus temas?',
      onConfirm: async () => {
        setConfirmDialog(d => ({ ...d, isOpen: false }));
        try {
          for (const t of topics.filter(t => t.blockId === id)) await api.unlinkTopicFromBlock(t.id);
          await api.deleteBlock(id);
          await loadBlocks();
        } catch (e: any) { alert(e.response?.data?.message || e.message); }
      },
    });
  };

  // ── Parallels logic ───────────────────────────────────────────────────────
  const loadParallels = async () => {
    setParallelsLoading(true);
    try {
      const [offeringsRes, groupsRes] = await Promise.all([
        api.getCourseOfferings(course.id),
        api.getAllGroups()
      ]);
      if (offeringsRes.success) setOfferings(offeringsRes.data || []);
      if (groupsRes.success) setAllGroups(groupsRes.data || []);
    } catch (e) { console.error(e); }
    finally { setParallelsLoading(false); }
  };

  const handleParallelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingParallel(true);
    try {
      let groupId = parallelForm.groupId;
      if (parallelForm.mode === 'new') {
        const res = await api.createGroup({ name: parallelForm.newGroupName, cohort: parallelForm.cohort });
        if (!res.success) throw new Error(res.message || 'Error al crear paralelo');
        groupId = res.data.id;
      }
      await api.createOffering({ courseId: course.id, groupId });
      setIsParallelModalOpen(false);
      setParallelForm({ groupId: '', newGroupName: '', cohort: '', mode: 'existing', selectedBlockIds: [] });
      await loadParallels();
    } catch (e: any) { alert(e.response?.data?.message || 'Error al crear paralelo'); }
    finally { setSavingParallel(false); }
  };

  // Groups not yet linked to this course
  const linkedGroupIds = offerings.map(o => o.group?.id);
  const availableGroups = allGroups.filter(g => !linkedGroupIds.includes(g.id));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 bg-slate-800 border border-slate-700/50 rounded-lg px-6 py-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 flex-shrink-0">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter truncate">{course.name}</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Gestión Académica del Curso</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 p-1 bg-slate-800 rounded-2xl w-fit border border-slate-700 shadow-xl mb-8">
        <button
          onClick={() => setSubTab('blocks')}
          className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${subTab === 'blocks' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          Bloques
        </button>
        {!hideParallelsTab && (
          <button
            onClick={() => setSubTab('parallels')}
            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${subTab === 'parallels' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Paralelos
          </button>
        )}
      </div>

      {/* ── BLOCKS TAB ── */}
      {subTab === 'blocks' && (
        <div>
          <div className="mb-6 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400 text-xl">📋</div>
              <div>
                <p className="text-xs font-black text-red-300 uppercase tracking-widest">Bloques Académicos</p>
                <p className="text-[10px] text-slate-400">Organiza los temas en bloques con metas de progreso y reglas de tutoría</p>
              </div>
            </div>
            <button onClick={() => openBlockModal()} className={BTN_PRIMARY}>+ Nuevo Bloque</button>
          </div>

          {blocksLoading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" /></div>
          ) : blocks.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-2xl">
              <p className="text-slate-500 text-sm font-black uppercase tracking-widest">Sin bloques definidos</p>
              <button onClick={() => openBlockModal()} className="text-red-500 text-xs mt-2 uppercase font-black hover:underline tracking-widest">Crear el primer bloque</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blocks.sort((a, b) => a.order - b.order).map(block => {
                const blockTopics = topics.filter(t => t.blockId === block.id);
                return (
                  <div key={block.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-red-500/50 transition-all group relative">
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-[10px] font-black text-red-500 shadow-xl z-10">
                      {block.order}
                    </div>
                    <h3 className="text-white font-black text-base mb-1 uppercase tracking-tighter group-hover:text-red-400 transition-colors pt-2">{block.name}</h3>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-700 pb-1 mt-3">Temas ({blockTopics.length})</p>
                    <div className="space-y-1 max-h-20 overflow-y-auto mb-4">
                      {blockTopics.length > 0 ? blockTopics.sort((a, b) => a.order - b.order).map(t => (
                        <div key={t.id} className="flex items-center gap-2 text-[10px] text-slate-300 bg-slate-900/40 px-2 py-1 rounded-lg">
                          <span className="text-red-500 font-bold">{t.order}</span>
                          <span className="truncate font-medium uppercase tracking-tighter">{t.title}</span>
                        </div>
                      )) : <p className="text-[9px] text-slate-600 italic uppercase">Sin temas asignados</p>}
                    </div>
                    <div className="space-y-2 pt-3 border-t border-slate-700/50 bg-slate-900/20 -mx-6 px-6 -mb-6 pb-5 rounded-b-2xl">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">Meta:</span>
                        <span className="text-white">Automática</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">Aprobación:</span>
                        <span className="text-white">{block.minPassGrade}/10</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">Tutoría:</span>
                        <span className={block.mandatoryTutoring ? 'text-green-500' : 'text-slate-500'}>{block.mandatoryTutoring ? 'Obligatoria' : 'Opcional'}</span>
                      </div>
                      <div className="flex gap-2 mt-3 justify-end">
                        <button onClick={() => openBlockModal(block)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-[9px] font-black text-white uppercase tracking-widest transition-all">Editar</button>
                        <button onClick={() => handleDeleteBlock(block.id)} className="px-3 py-2 bg-red-900/10 hover:bg-red-500/20 rounded-lg text-[9px] font-black text-red-500 uppercase tracking-widest border border-red-500/20 transition-all">Eliminar</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── PARALLELS TAB ── */}
      {subTab === 'parallels' && (
        <div>
          <div className="mb-6 p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 text-xl">👥</div>
              <div>
                <p className="text-xs font-black text-blue-300 uppercase tracking-widest">Paralelos del Curso</p>
                <p className="text-[10px] text-slate-400">Grupos de estudiantes asignados a este curso</p>
              </div>
            </div>
            <button onClick={() => setIsParallelModalOpen(true)} className={BTN_PRIMARY}>+ Nuevo Paralelo</button>
          </div>

          {parallelsLoading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" /></div>
          ) : offerings.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-2xl">
              <p className="text-slate-500 text-sm font-black uppercase tracking-widest">Sin paralelos asignados</p>
              <button onClick={() => setIsParallelModalOpen(true)} className="text-red-500 text-xs mt-2 uppercase font-black hover:underline tracking-widest">Asignar el primer paralelo</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offerings.map(offering => (
                <div key={offering.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 text-xl font-black">
                      {offering.group?.name?.charAt(0) || 'P'}
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-black rounded-md uppercase tracking-widest ${offering.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                      {offering.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{offering.group?.name || 'Sin nombre'}</h3>
                  {offering.tutor && (
                    <p className="text-xs text-slate-400 mt-1">Tutor: {offering.tutor.names} {offering.tutor.lastNames}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── BLOCK MODAL ── */}
      <Modal isOpen={isBlockModalOpen} onClose={() => setIsBlockModalOpen(false)} title={editingBlock ? 'Editar Bloque' : 'Nuevo Bloque'}>
        <form onSubmit={handleBlockSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nombre *</label>
              <input required className={INPUT_CLS} value={blockForm.name} onChange={e => setBlockForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Unidad 1: Fundamentos" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Orden *</label>
              <input type="number" required className={INPUT_CLS} value={blockForm.order} onChange={e => setBlockForm(f => ({ ...f, order: Number(e.target.value) }))} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Temas a incluir</label>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 max-h-44 overflow-y-auto space-y-1">
              {topics.length === 0 ? (
                <p className="text-[10px] text-slate-600 text-center py-4 uppercase font-black italic">No hay temas creados en este curso</p>
              ) : topics.sort((a, b) => a.order - b.order).map(t => (
                <label key={t.id} className="flex items-center gap-3 p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-red-600 focus:ring-red-500"
                    checked={blockForm.selectedTopicIds.includes(t.id)}
                    onChange={e => {
                      const ids = e.target.checked ? [...blockForm.selectedTopicIds, t.id] : blockForm.selectedTopicIds.filter(id => id !== t.id);
                      setBlockForm(f => ({ ...f, selectedTopicIds: ids }));
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-white uppercase truncate">{t.title}</p>
                    <p className="text-[9px] text-slate-500 uppercase font-black">Orden: {t.order}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nota Mín. Aprobación</label>
              <input type="number" step="0.1" className={INPUT_CLS} value={blockForm.minPassGrade} onChange={e => setBlockForm(f => ({ ...f, minPassGrade: Number(e.target.value) }))} />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-xl">
            <div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Tutoría Obligatoria</p>
              <p className="text-[9px] text-slate-500 uppercase">¿Debe aprobar la sesión con el tutor?</p>
            </div>
            <button type="button" onClick={() => setBlockForm(f => ({ ...f, mandatoryTutoring: !f.mandatoryTutoring }))}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${blockForm.mandatoryTutoring ? 'bg-green-600' : 'bg-slate-600'}`}>
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${blockForm.mandatoryTutoring ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsBlockModalOpen(false)} className={BTN_GHOST + ' flex-1 text-[10px]'}>Cancelar</button>
            <button type="submit" disabled={savingBlock} className={BTN_PRIMARY + ' flex-1 text-[10px] disabled:opacity-50'}>
              {savingBlock ? 'Guardando...' : editingBlock ? 'Guardar Cambios' : 'Crear Bloque'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── PARALLEL MODAL ── */}
      <Modal isOpen={isParallelModalOpen} onClose={() => setIsParallelModalOpen(false)} title="Asignar Paralelo al Curso">        <form onSubmit={handleParallelSubmit} className="space-y-4">
          <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-700">
            <button type="button" onClick={() => setParallelForm(f => ({ ...f, mode: 'existing' }))}
              className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${parallelForm.mode === 'existing' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              Paralelo Existente
            </button>
            <button type="button" onClick={() => setParallelForm(f => ({ ...f, mode: 'new' }))}
              className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${parallelForm.mode === 'new' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              Crear Nuevo
            </button>
          </div>

          {parallelForm.mode === 'existing' ? (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Seleccionar Paralelo</label>
              <select required className={INPUT_CLS} value={parallelForm.groupId} onChange={e => setParallelForm(f => ({ ...f, groupId: e.target.value }))}>
                <option value="">-- Selecciona un paralelo --</option>
                {availableGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              {availableGroups.length === 0 && (
                <p className="text-[10px] text-slate-500 mt-1 italic">Todos los paralelos ya están asignados a este curso</p>
              )}
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nombre del Paralelo *</label>
                <input required className={INPUT_CLS} value={parallelForm.newGroupName} onChange={e => setParallelForm(f => ({ ...f, newGroupName: e.target.value }))} placeholder="Ej: Paralelo A" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Generación / Cohorte</label>
                <input required className={INPUT_CLS} value={parallelForm.cohort} onChange={e => setParallelForm(f => ({ ...f, cohort: e.target.value }))} placeholder="Ej: Gen 2026-A" />
              </div>
            </>
          )}

          {/* Bloques del curso — seleccionables */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Bloques del Curso <span className="text-slate-600 normal-case font-medium">(selecciona los que aplican a este paralelo)</span>
            </label>
            {blocks.length === 0 ? (
              <div className="p-4 bg-slate-900/60 border border-dashed border-slate-700 rounded-xl text-center">
                <p className="text-[10px] text-slate-500 uppercase font-black">Este curso aún no tiene bloques definidos</p>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-3 space-y-2 max-h-52 overflow-y-auto">
                {blocks.sort((a, b) => a.order - b.order).map(block => {
                  const selected = parallelForm.selectedBlockIds.includes(block.id);
                  return (
                    <button
                      key={block.id}
                      type="button"
                      onClick={() => {
                        const ids = selected
                          ? parallelForm.selectedBlockIds.filter(id => id !== block.id)
                          : [...parallelForm.selectedBlockIds, block.id];
                        setParallelForm(f => ({ ...f, selectedBlockIds: ids }));
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                        selected
                          ? 'bg-red-600/15 border-red-500/50'
                          : 'bg-slate-800 border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 transition-colors ${
                        selected ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {selected ? '✓' : block.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[10px] font-black uppercase tracking-tighter truncate transition-colors ${selected ? 'text-white' : 'text-slate-300'}`}>{block.name}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-bold">
                          Aprobación: {block.minPassGrade}/10 · Tutoría: {block.mandatoryTutoring ? 'Obligatoria' : 'Opcional'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsParallelModalOpen(false)} className={BTN_GHOST + ' flex-1 text-[10px]'}>Cancelar</button>
            <button type="submit" disabled={savingParallel} className={BTN_PRIMARY + ' flex-1 text-[10px] disabled:opacity-50'}>
              {savingParallel ? 'Guardando...' : 'Asignar Paralelo'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel="Eliminar"
        danger
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(d => ({ ...d, isOpen: false }))}
      />
    </div>
  );
}
