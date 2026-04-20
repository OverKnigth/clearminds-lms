import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import type { CourseData } from '../types';
import Modal from '../../../components/Modal';
import { useDialog } from '../../../hooks/useDialog';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import DateTimePicker from '../../../components/DateTimePicker';

interface Topic {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  order: number;
  blockId: string | null;
}

interface Content {
  id: string;
  topicId: string;
  type: 'video' | 'document' | 'challenge';
  title: string;
  description: string | null;
  instructions: string | null;
  evaluationCriteria: string | null;
  url: string | null;
  order: number;
  durationMinutes: number | null;
  deadline: string | null;
  allowDownload: boolean;
  minProgressToComplete: number;
}

interface CourseContentTabProps {
  course: CourseData;
  onBack: () => void;
}

const INPUT_CLS = 'w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500';
const BTN_PRIMARY = 'px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-medium rounded-lg transition-all';
const BTN_GHOST = 'px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors';

const TYPE_ICONS: Record<string, string> = {
  video: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  challenge: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
};
const TYPE_COLORS: Record<string, string> = {
  video: 'text-red-400 bg-red-500/20',
  document: 'text-blue-400 bg-blue-500/20',
  challenge: 'text-purple-400 bg-purple-500/20',
};

export function CourseContentTab({ course, onBack }: CourseContentTabProps) {
  const [activeTab, setActiveTab] = useState<'topics' | 'blocks'>('topics');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [contentsByTopic, setContentsByTopic] = useState<Record<string, Content[]>>({});
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Topic modal
  const [topicModal, setTopicModal] = useState<{ open: boolean; editing: Topic | null }>({ open: false, editing: null });
  const [topicForm, setTopicForm] = useState({ title: '', description: '', order: 1, blockId: '' });
  const [savingTopic, setSavingTopic] = useState(false);
  const [courseBlocks, setCourseBlocks] = useState<any[]>([]);

  // Block modal
  const [blockModal, setBlockModal] = useState<{ open: boolean; editing: any | null }>({ open: false, editing: null });
  const [blockForm, setBlockForm] = useState({ name: '', order: 1, minPassGrade: 7, mandatoryTutoring: true, selectedTopicIds: [] as string[] });
  const [savingBlock, setSavingBlock] = useState(false);
  const { dialog, showAlert, showConfirm, close: closeDialog } = useDialog();

  // Content modal
  const [contentModal, setContentModal] = useState<{ open: boolean; topicId: string; editing: Content | null }>({ open: false, topicId: '', editing: null });
  const [contentForm, setContentForm] = useState({
    type: 'video' as 'video' | 'document' | 'challenge',
    title: '',
    description: '',
    instructions: '',
    evaluationCriteria: '',
    url: '',
    order: 1,
    durationMinutes: 0,
    deadline: '',
    allowDownload: false,
    minProgressToComplete: 90, // Mantenemos internamente pero no se edita manualmente
  });
  const [savingContent, setSavingContent] = useState(false);
  const [fetchingMeta, setFetchingMeta] = useState(false);

  useEffect(() => {
    loadTopics();
    loadBlocks();
  }, [course.id]);

  const loadTopics = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCourseTopics(course.id);
      console.log('[loadTopics] courseId:', course.id, 'response:', res);
      if (res.success) {
        setTopics(res.data);
        const entries = await Promise.all(
          res.data.map(async (t: Topic) => {
            const cr = await api.getTopicContents(t.id);
            console.log('[loadTopics] topicId:', t.id, 'contents:', cr);
            return [t.id, cr.success ? cr.data : []] as [string, Content[]];
          })
        );
        setContentsByTopic(Object.fromEntries(entries));
        setExpandedTopics(new Set(res.data.map((t: Topic) => t.id)));
      }
    } catch (e) {
      console.error('[loadTopics] error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBlocks = async () => {
    try {
      const res = await api.getCourseDetail(course.id);
      if (res.success) setCourseBlocks(res.data.blocks || []);
    } catch (e) {
      console.error('[loadBlocks] error:', e);
    }
  };

  // ── Block handlers ──────────────────────────────────────────────────────────
  const openAddBlock = () => {
    setBlockForm({ name: '', order: courseBlocks.length + 1, minPassGrade: 7, mandatoryTutoring: true, selectedTopicIds: [] });
    setBlockModal({ open: true, editing: null });
  };

  const openEditBlock = (b: any) => {
    setBlockForm({
      name: b.name, order: b.order, minPassGrade: b.minPassGrade,
      mandatoryTutoring: b.mandatoryTutoring,
      selectedTopicIds: topics.filter(t => t.blockId === b.id).map(t => t.id),
    });
    setBlockModal({ open: true, editing: b });
  };

  const saveBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBlock(true);
    try {
      const payload = { name: blockForm.name, order: blockForm.order, expectedProgress: 100, mandatoryTutoring: blockForm.mandatoryTutoring, minPassGrade: blockForm.minPassGrade };
      let blockId: string;
      if (blockModal.editing) {
        await api.updateBlock(blockModal.editing.id, payload);
        blockId = blockModal.editing.id;
      } else {
        const res = await api.createBlock(course.id, payload);
        if (!res.success) throw new Error(res.message || 'Error al crear bloque');
        blockId = res.data?.id || res.data?.block?.id;
        if (!blockId) throw new Error('No se recibió ID del bloque');
      }
      // Sync topic links
      const oldTopics = topics.filter(t => t.blockId === (blockModal.editing?.id ?? blockId));
      for (const t of oldTopics) {
        if (!blockForm.selectedTopicIds.includes(t.id)) await api.unlinkTopicFromBlock(t.id);
      }
      for (const id of blockForm.selectedTopicIds) {
        const topic = topics.find(t => t.id === id);
        if (!topic || topic.blockId !== blockId) await api.linkTopicToBlock(id, blockId);
      }
      setBlockModal({ open: false, editing: null });
      await Promise.all([loadBlocks(), loadTopics()]);
    } catch (e: any) {
      showAlert(e.response?.data?.message || e.message);
    } finally { setSavingBlock(false); }
  };

  const deleteBlock = async (id: string) => {
    showConfirm('¿Eliminar este bloque y desvincular sus temas?', async () => {
      try {
        for (const t of topics.filter(t => t.blockId === id)) await api.unlinkTopicFromBlock(t.id);
        await api.deleteBlock(id);
        await Promise.all([loadBlocks(), loadTopics()]);
      } catch (e: any) { showAlert(e.response?.data?.message || e.message); }
    }, { title: 'Eliminar bloque', confirmLabel: 'Eliminar', danger: true });
  };

  // ── Topic handlers ──────────────────────────────────────────────────────────
  const openAddTopic = () => {
    setTopicForm({ title: '', description: '', order: topics.length + 1, blockId: '' });
    setTopicModal({ open: true, editing: null });
  };

  const openEditTopic = (t: Topic) => {
    setTopicForm({ title: t.title, description: t.description || '', order: t.order, blockId: t.blockId || '' });
    setTopicModal({ open: true, editing: t });
  };

  const saveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTopic(true);
    try {
      const payload: any = {
        title: topicForm.title,
        order: topicForm.order,
      };
      if (topicForm.description.trim()) payload.description = topicForm.description;
      if (topicForm.blockId.trim()) payload.blockId = topicForm.blockId;

      if (topicModal.editing) {
        await api.updateTopic(topicModal.editing.id, payload);
      } else {
        await api.createTopic(course.id, payload);
      }
      setTopicModal({ open: false, editing: null });
      await loadTopics();
    } catch (e: any) {
      showAlert(e.response?.data?.message || e.message);
    } finally {
      setSavingTopic(false);
    }
  };

  const deleteTopic = async (t: Topic) => {
    showConfirm(`¿Eliminar el tema "${t.title}"? Se eliminarán todos sus contenidos.`, async () => {
      try {
        await api.deleteTopic(t.id);
        await loadTopics();
      } catch (e: any) {
        showAlert(e.response?.data?.message || e.message);
      }
    }, { title: 'Eliminar tema', confirmLabel: 'Eliminar', danger: true });
  };

  // ── Video metadata detection ────────────────────────────────────────────────
  const getYouTubeId = (url: string) => {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  };

  const getVimeoId = (url: string) => {
    const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? m[1] : null;
  };

  const fetchVideoDuration = async (url: string) => {
    if (!url.trim()) return;
    setFetchingMeta(true);
    try {
      const ytId = getYouTubeId(url);
      if (ytId) {
        // YouTube oEmbed doesn't give duration, use noembed.com proxy
        const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${ytId}`);
        const data = await res.json();
        // noembed doesn't return duration either — use YouTube's oembed thumbnail trick
        // Instead, fetch duration via youtube-nocookie iframe API workaround isn't possible without API key
        // Use a public proxy: ytdl-info or similar isn't reliable
        // Best approach: use oEmbed title at minimum
        if (data.title && !contentForm.title) {
          setContentForm(f => ({ ...f, title: data.title }));
        }
        // Duration not available without API key — leave field editable
        return;
      }

      const vimeoId = getVimeoId(url);
      if (vimeoId) {
        const res = await fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}`);
        const data = await res.json();
        if (data.title && !contentForm.title) {
          setContentForm(f => ({ ...f, title: data.title }));
        }
        if (data.duration) {
          const mins = Math.ceil(data.duration / 60);
          setContentForm(f => ({ ...f, durationMinutes: mins }));
        }
      }
    } catch (e) {
      // silently fail — user can fill manually
    } finally {
      setFetchingMeta(false);
    }
  };

  const handleUrlChange = (url: string) => {
    let cleanUrl = url.trim();
    // Convertir links de YouTube embed a watch automáticamente
    if (cleanUrl.includes('youtube.com/embed/')) {
      const id = cleanUrl.split('embed/')[1]?.split('?')[0];
      cleanUrl = `https://www.youtube.com/watch?v=${id}`;
    }
    // Convertir links de Vimeo player a la URL normal de Vimeo
    if (cleanUrl.includes('player.vimeo.com/video/')) {
      const id = cleanUrl.split('video/')[1]?.split('?')[0];
      cleanUrl = `https://vimeo.com/${id}`;
    }
    setContentForm(f => ({ ...f, url: cleanUrl }));
    if (contentForm.type === 'video') {
      fetchVideoDuration(cleanUrl);
    }
  };
  const openAddContent = (topicId: string) => {
    const existing = contentsByTopic[topicId] || [];
    setContentForm({ 
      type: 'video', title: '', description: '', 
      instructions: '', evaluationCriteria: '',
      url: '', order: existing.length + 1, durationMinutes: 0, 
      deadline: '', allowDownload: false, minProgressToComplete: 90 
    });
    setContentModal({ open: true, topicId, editing: null });
  };

  const openEditContent = (topicId: string, c: Content) => {
    setContentForm({
      type: c.type, title: c.title, description: c.description || '',
      instructions: c.instructions || '', evaluationCriteria: c.evaluationCriteria || '',
      url: c.url || '', order: c.order, durationMinutes: c.durationMinutes || 0,
      deadline: c.deadline ? new Date(c.deadline).toISOString().slice(0, 16) : '',
      allowDownload: c.allowDownload || false,
      minProgressToComplete: c.minProgressToComplete || 90,
    });
    setContentModal({ open: true, topicId, editing: c });
  };

  const saveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContent(true);
    try {
      const payload: any = {
        type: contentForm.type,
        title: contentForm.title,
        order: contentForm.order,
      };
      if (contentForm.description.trim()) payload.description = contentForm.description;
      if (contentForm.instructions.trim()) payload.instructions = contentForm.instructions;
      if (contentForm.evaluationCriteria.trim()) payload.evaluationCriteria = contentForm.evaluationCriteria;
      if (contentForm.url.trim()) payload.url = contentForm.url;
      if (contentForm.type === 'video' && contentForm.durationMinutes > 0) payload.durationMinutes = contentForm.durationMinutes;
      if (contentForm.deadline) payload.deadline = new Date(contentForm.deadline).toISOString();
      if (contentForm.type !== 'video') payload.allowDownload = contentForm.allowDownload;
      if (contentForm.type === 'video') payload.minProgressToComplete = contentForm.minProgressToComplete;

      console.log('[saveContent] topicId:', contentModal.topicId, 'payload:', payload);

      if (contentModal.editing) {
        const res = await api.updateContent(contentModal.editing.id, payload);
        console.log('[saveContent] update response:', res);
      } else {
        const res = await api.createContent(contentModal.topicId, payload);
        console.log('[saveContent] create response:', res);
      }
      setContentModal({ open: false, topicId: '', editing: null });
      await loadTopics();
    } catch (e: any) {
      console.error('[saveContent] error:', e.response?.data || e.message);
      showAlert(e.response?.data?.message || e.message);
    } finally {
      setSavingContent(false);
    }
  };

  const deleteContent = async (c: Content) => {
    showConfirm(`¿Eliminar "${c.title}"?`, async () => {
      try {
        await api.deleteContent(c.id);
        await loadTopics();
      } catch (e: any) {
        showAlert(e.response?.data?.message || e.message);
      }
    }, { title: 'Eliminar contenido', confirmLabel: 'Eliminar', danger: true });
  };

  const toggleTopic = (id: string) => {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-white">{course.name}</h2>
          <p className="text-sm text-slate-400">Gestión de temas y contenidos</p>
        </div>
        {activeTab === 'topics' ? (
          <button onClick={openAddTopic} className={BTN_PRIMARY}>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Tema
            </span>
          </button>
        ) : (
          <button onClick={openAddBlock} className={BTN_PRIMARY}>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Bloque
            </span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-800 rounded-xl w-fit border border-slate-700 mb-6">
        <button onClick={() => setActiveTab('topics')}
          className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'topics' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
          Temas
        </button>
        <button onClick={() => setActiveTab('blocks')}
          className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'blocks' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
          Bloques {courseBlocks.length > 0 && <span className="ml-1 opacity-70">({courseBlocks.length})</span>}
        </button>
      </div>

      {/* ── TOPICS TAB ── */}
      {activeTab === 'topics' && (isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-xl">
          <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-slate-400 mb-4">Este curso no tiene temas aún</p>
          <button onClick={openAddTopic} className={BTN_PRIMARY}>Crear primer tema</button>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.sort((a, b) => a.order - b.order).map(topic => {
            const contents = contentsByTopic[topic.id] || [];
            const isExpanded = expandedTopics.has(topic.id);
            return (
              <div key={topic.id} className="bg-slate-800 rounded-xl border border-slate-700">
                {/* Topic header */}
                <div className="flex items-center gap-3 p-4">
                  <button onClick={() => toggleTopic(topic.id)} className="text-slate-400 hover:text-white transition-colors">
                    <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 text-xs font-bold shrink-0">
                    {topic.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{topic.title}</p>
                    {topic.description && <p className="text-xs text-slate-400 truncate">{topic.description}</p>}
                  </div>
                  <span className="text-xs text-slate-500">{contents.length} contenido{contents.length !== 1 ? 's' : ''}</span>
                  <div className="flex gap-1">
                    <button onClick={() => openAddContent(topic.id)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-green-400 transition-colors" title="Agregar contenido">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button onClick={() => openEditTopic(topic)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-yellow-400 transition-colors" title="Editar tema">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => deleteTopic(topic)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors" title="Eliminar tema">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Contents */}
                {isExpanded && (
                  <div className="border-t border-slate-700 px-4 pb-4 pt-3 space-y-2">
                    {contents.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-3">Sin contenidos — agrega uno con el botón +</p>
                    ) : (
                      contents.sort((a, b) => a.order - b.order).map(c => (
                        <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${TYPE_COLORS[c.type]}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={TYPE_ICONS[c.type]} />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium truncate">{c.title}</p>
                            <p className="text-xs text-slate-400">
                              {c.type === 'video' && c.durationMinutes ? `${c.durationMinutes} min · ` : ''}
                              {c.type === 'challenge' && c.deadline ? `Límite: ${new Date(c.deadline).toLocaleDateString('es')} · ` : ''}
                              Orden: {c.order}
                              {c.url && <span className="ml-2 text-blue-400">· URL</span>}
                            </p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditContent(topic.id, c)} className="p-1.5 hover:bg-slate-600 rounded text-slate-400 hover:text-yellow-400 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button onClick={() => deleteContent(c)} className="p-1.5 hover:bg-slate-600 rounded text-slate-400 hover:text-red-400 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                    <button onClick={() => openAddContent(topic.id)} className="w-full py-2 border border-dashed border-slate-600 hover:border-red-500 text-slate-500 hover:text-red-400 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Agregar contenido
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* ── BLOCKS TAB ── */}
      {activeTab === 'blocks' && (
        courseBlocks.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-700 rounded-xl">
            <p className="text-slate-400 mb-4">Este curso no tiene bloques aún</p>
            <button onClick={openAddBlock} className={BTN_PRIMARY}>Crear primer bloque</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseBlocks.sort((a, b) => a.order - b.order).map(block => {
              const blockTopics = topics.filter(t => t.blockId === block.id);
              return (
                <div key={block.id} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-red-500/50 transition-all group relative">
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-[10px] font-black text-red-500 shadow-xl z-10">
                    {block.order}
                  </div>
                  <h3 className="text-white font-black text-base mb-3 uppercase tracking-tighter group-hover:text-red-400 transition-colors pt-2">{block.name}</h3>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-700 pb-1">Temas ({blockTopics.length})</p>
                  <div className="space-y-1 max-h-20 overflow-y-auto mb-4">
                    {blockTopics.length > 0 ? blockTopics.sort((a, b) => a.order - b.order).map(t => (
                      <div key={t.id} className="flex items-center gap-2 text-[10px] text-slate-300 bg-slate-900/40 px-2 py-1 rounded-lg">
                        <span className="text-red-500 font-bold">{t.order}</span>
                        <span className="truncate font-medium uppercase tracking-tighter">{t.title}</span>
                      </div>
                    )) : <p className="text-[9px] text-slate-600 italic uppercase">Sin temas asignados</p>}
                  </div>
                  <div className="space-y-1 pt-3 border-t border-slate-700/50 text-[10px] font-black uppercase tracking-widest mb-4">
                    <div className="flex justify-between"><span className="text-slate-500">Aprobación:</span><span className="text-white">{block.minPassGrade}/10</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Tutoría:</span><span className={block.mandatoryTutoring ? 'text-green-500' : 'text-slate-500'}>{block.mandatoryTutoring ? 'Obligatoria' : 'Opcional'}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditBlock(block)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-[9px] font-black text-white uppercase tracking-widest transition-all">Editar</button>
                    <button onClick={() => deleteBlock(block.id)} className="px-3 py-2 bg-red-900/10 hover:bg-red-500/20 rounded-lg text-[9px] font-black text-red-500 uppercase tracking-widest border border-red-500/20 transition-all">Eliminar</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Topic Modal */}
      <Modal isOpen={topicModal.open} onClose={() => setTopicModal({ open: false, editing: null })} title={topicModal.editing ? 'Editar Tema' : 'Nuevo Tema'}>
        <form onSubmit={saveTopic} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Título *</label>
            <input required className={INPUT_CLS} value={topicForm.title} onChange={e => setTopicForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: Introducción a JavaScript" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Descripción</label>
            <textarea rows={2} className={INPUT_CLS} value={topicForm.description} onChange={e => setTopicForm(f => ({ ...f, description: e.target.value }))} placeholder="Descripción opcional del tema" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Orden *</label>
              <input required type="number" min={1} className={INPUT_CLS} value={topicForm.order} onChange={e => setTopicForm(f => ({ ...f, order: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Vincular a Bloque Estratégico</label>
              <select 
                className={INPUT_CLS} 
                value={topicForm.blockId} 
                onChange={e => setTopicForm(f => ({ ...f, blockId: e.target.value }))}
              >
                <option value="">-- No vincular --</option>
                {courseBlocks.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={savingTopic} className={`flex-1 py-2.5 ${BTN_PRIMARY} disabled:opacity-50`}>
              {savingTopic ? 'Guardando...' : topicModal.editing ? 'Guardar cambios' : 'Crear tema'}
            </button>
            <button type="button" onClick={() => setTopicModal({ open: false, editing: null })} className={BTN_GHOST}>Cancelar</button>
          </div>
        </form>
      </Modal>

      {/* Block Modal */}
      <Modal isOpen={blockModal.open} onClose={() => setBlockModal({ open: false, editing: null })} title={blockModal.editing ? 'Editar Bloque' : 'Nuevo Bloque'}>
        <form onSubmit={saveBlock} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre *</label>
              <input required className={INPUT_CLS} value={blockForm.name} onChange={e => setBlockForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Unidad 1: Fundamentos" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Orden *</label>
              <input type="number" required className={INPUT_CLS} value={blockForm.order} onChange={e => setBlockForm(f => ({ ...f, order: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Temas a incluir</label>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 max-h-44 overflow-y-auto space-y-1">
              {topics.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4 italic">No hay temas creados en este curso</p>
              ) : topics.sort((a, b) => a.order - b.order).map(t => (
                <label key={t.id} className="flex items-center gap-3 p-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                  <input type="checkbox" className="w-4 h-4 accent-red-500"
                    checked={blockForm.selectedTopicIds.includes(t.id)}
                    onChange={e => {
                      const ids = e.target.checked ? [...blockForm.selectedTopicIds, t.id] : blockForm.selectedTopicIds.filter(id => id !== t.id);
                      setBlockForm(f => ({ ...f, selectedTopicIds: ids }));
                    }} />
                  <span className="text-xs font-medium text-white uppercase truncate">{t.order}. {t.title}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nota Mín. Aprobación</label>
              <input type="number" step="0.1" className={INPUT_CLS} value={blockForm.minPassGrade} onChange={e => setBlockForm(f => ({ ...f, minPassGrade: Number(e.target.value) }))} />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700 rounded-xl mt-auto">
              <p className="text-xs font-medium text-white">Tutoría Obligatoria</p>
              <button type="button" onClick={() => setBlockForm(f => ({ ...f, mandatoryTutoring: !f.mandatoryTutoring }))}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${blockForm.mandatoryTutoring ? 'bg-green-600' : 'bg-slate-600'}`}>
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${blockForm.mandatoryTutoring ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={savingBlock} className={`flex-1 py-2.5 ${BTN_PRIMARY} disabled:opacity-50`}>
              {savingBlock ? 'Guardando...' : blockModal.editing ? 'Guardar cambios' : 'Crear bloque'}
            </button>
            <button type="button" onClick={() => setBlockModal({ open: false, editing: null })} className={BTN_GHOST}>Cancelar</button>
          </div>
        </form>
      </Modal>

      {/* Content Modal */}
      <Modal isOpen={contentModal.open} onClose={() => setContentModal({ open: false, topicId: '', editing: null })} title={contentModal.editing ? 'Editar Contenido' : 'Nuevo Contenido'}>
        <form onSubmit={saveContent} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Tipo *</label>
            <div className="grid grid-cols-3 gap-2">
              {(['video', 'document', 'challenge'] as const).map(t => (
                <button key={t} type="button" onClick={() => setContentForm(f => ({ ...f, type: t }))}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${contentForm.type === t ? 'border-red-500 bg-red-500/20 text-red-400' : 'border-slate-600 bg-slate-700 text-slate-400 hover:border-slate-500'}`}>
                  {t === 'video' ? 'Video' : t === 'document' ? 'Documento' : 'Reto'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Título *</label>
            <input required className={INPUT_CLS} value={contentForm.title} onChange={e => setContentForm(f => ({ ...f, title: e.target.value }))}
              placeholder={contentForm.type === 'challenge' ? 'Ej: Reto: Crea tu primera API' : contentForm.type === 'document' ? 'Ej: Guía de referencia ES6' : 'Ej: Variables y tipos de datos'} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              {contentForm.type === 'challenge' ? 'Enunciado / Descripción' : 'Descripción'}
            </label>
            <textarea rows={3} className={INPUT_CLS} value={contentForm.description}
              onChange={e => setContentForm(f => ({ ...f, description: e.target.value }))}
              placeholder={contentForm.type === 'challenge' ? 'Describe el reto...' : 'Descripción opcional'} />
          </div>

          {contentForm.type === 'challenge' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Instrucciones</label>
                <textarea rows={3} className={INPUT_CLS} value={contentForm.instructions}
                  onChange={e => setContentForm(f => ({ ...f, instructions: e.target.value }))}
                  placeholder="Instrucciones paso a paso para el estudiante..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Criterios de Evaluación</label>
                <textarea rows={3} className={INPUT_CLS} value={contentForm.evaluationCriteria}
                  onChange={e => setContentForm(f => ({ ...f, evaluationCriteria: e.target.value }))}
                  placeholder="¿Qué se evaluará en este reto?" />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              {contentForm.type === 'document' ? 'URL del documento / enlace externo' : contentForm.type === 'challenge' ? 'Documento de apoyo (URL, opcional)' : 'URL del video'}
            </label>
            <div className="relative">
              <input className={INPUT_CLS} value={contentForm.url}
                onChange={e => handleUrlChange(e.target.value)}
                onBlur={e => contentForm.type === 'video' && fetchVideoDuration(e.target.value)}
                placeholder={contentForm.type === 'document' ? 'https://drive.google.com/... o https://...' : 'https://...'} />
              {fetchingMeta && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                </div>
              )}
            </div>
            {contentForm.type === 'video' && contentForm.url && (getYouTubeId(contentForm.url) || getVimeoId(contentForm.url)) && (
              <p className="text-xs text-green-400 mt-1">
                ✓ {getYouTubeId(contentForm.url) ? 'YouTube' : 'Vimeo'} detectado
                {getVimeoId(contentForm.url) ? ' — duración obtenida automáticamente' : ' — ingresa la duración manualmente'}
              </p>
            )}
          </div>

          {(contentForm.type === 'document' || contentForm.type === 'challenge') && (
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <div>
                <p className="text-sm font-medium text-white">Permitir descarga</p>
                <p className="text-xs text-slate-400">El estudiante podrá descargar este archivo</p>
              </div>
              <button
                type="button"
                onClick={() => setContentForm(f => ({ ...f, allowDownload: !f.allowDownload }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${contentForm.allowDownload ? 'bg-red-600' : 'bg-slate-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${contentForm.allowDownload ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Orden *</label>
              <input required type="number" min={1} className={INPUT_CLS} value={contentForm.order}
                onChange={e => setContentForm(f => ({ ...f, order: Number(e.target.value) }))} />
            </div>
            {contentForm.type === 'video' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Duración (min)</label>
                <input type="number" min={0} className={INPUT_CLS} value={contentForm.durationMinutes}
                  onChange={e => setContentForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))} />
              </div>
            )}
            {contentForm.type === 'challenge' && (
              <DateTimePicker 
                label="Fecha límite"
                value={contentForm.deadline}
                onChange={(val) => setContentForm(f => ({ ...f, deadline: val }))}
              />
            )}
          </div>

          {contentForm.type === 'document' && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300">
              Los documentos son de consulta y no bloquean el flujo del estudiante.
            </div>
          )}
          {contentForm.type === 'challenge' && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs text-purple-300">
              El estudiante entregará la URL de su repositorio Git. Si hay fecha límite, las entregas tardías se marcarán automáticamente.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={savingContent} className={`flex-1 py-2.5 ${BTN_PRIMARY} disabled:opacity-50`}>
              {savingContent ? 'Guardando...' : contentModal.editing ? 'Guardar cambios' : 'Crear contenido'}
            </button>
            <button type="button" onClick={() => setContentModal({ open: false, topicId: '', editing: null })} className={BTN_GHOST}>Cancelar</button>
          </div>
        </form>
      </Modal>
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
