import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayerImport from 'react-player';
const ReactPlayer = ReactPlayerImport as any;
import { MuxVideoPlayer } from '../components/MuxVideoPlayer';
import { api } from '@/shared/services/api';
import Footer from '@/shared/components/Footer';
import Modal from '@/shared/components/Modal';

interface Content {
  id: string;
  slug: string;
  type: 'video' | 'document' | 'challenge';
  title: string;
  description: string | null;
  instructions: string | null;
  evaluationCriteria: string | null;
  url: string | null;
  supportUrl: string | null;
  order: number;
  durationMinutes: number | null;
  deadline: string | null;
  allowDownload: boolean;
  minProgressToComplete: number;
  progress: { status: string; pctWatched: number; completedAt: string | null };
  submission: {
    id: string; gitUrl: string; comment: string | null;
    submittedAt: string; isLate: boolean; status: string;
    grade: number | null; observations: string | null;
  } | null;
}

export default function ContentView() {
  const { courseSlug, contentSlug } = useParams<{ courseSlug: string; contentSlug: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gitUrl, setGitUrl] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastSavedProgress, setLastSavedProgress] = useState(0);
  const [tutoringSessions, setTutoringSessions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const progressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);

  useEffect(() => {
    if (courseSlug && contentSlug) loadContent(courseSlug, contentSlug);
    return () => { if (progressTimer.current) clearTimeout(progressTimer.current); };
  }, [courseSlug, contentSlug]);

  useEffect(() => {
    loadTutoring();
  }, []);

  const loadTutoring = async () => {
    try {
      const res = await api.getStudentTutoring();
      if (res.success) setTutoringSessions(res.data);
    } catch (e) {
      console.error('Error fetching tutoring sessions:', e);
    }
  };

  // Helper: verifica si todos los contenidos del bloque están completados
  const isBlockCompleted = (courseData: any, topic: any): boolean => {
    if (!topic?.blockId || !courseData) return false;
    const blockContents: any[] = [];
    for (const t of courseData.topics) {
      if (t.blockId === topic.blockId) {
        blockContents.push(...t.contents);
      }
    }
    if (blockContents.length === 0) return false;
    
    // Verificar que TODOS los contenidos del bloque estén completados
    return blockContents.every((c: any) => {
      if (c.type === 'challenge') {
        // En el frontend, el submission ya trae el grade si está calificado. Se requiere grade >= 7 (regla unificada).
        return c.submission?.status === 'reviewed' && (c.submission.grade || 0) >= 7;
      }
      return (c.progress?.status === 'completed' || c.progress?.pctWatched >= (c.minProgressToComplete || 90));
    });
  };

  const checkAndShowTutoringModal = (courseData: any, topic: any, contentId?: string, sessions?: any[]) => {
    if (!topic?.blockId || !contentId) return;
    const blockId = topic.blockId;
    const activeSessions = sessions ?? tutoringSessions;
    
    // 1. Obtener todos los contenidos del bloque en orden
    const blockContents: any[] = [];
    for (const t of courseData.topics) {
      if (t.blockId === blockId) {
        blockContents.push(...t.contents);
      }
    }
    if (blockContents.length === 0) return;

    // 2. Verificar que el contenido actual sea el ÚLTIMO del bloque
    const lastContent = blockContents[blockContents.length - 1];
    if (lastContent.id !== contentId) return;

    // 3. Verificar si el bloque entero está completado
    if (!isBlockCompleted(courseData, topic)) return;

    // 4. Si el bloque NO requiere tutoría, no mostrar
    if (courseData.blocks?.[0]?.tutor_required === false) {
      const block = courseData.blocks?.find((b: any) => b.id === blockId);
      if (block && !block.tutor_required) return;
    }

    // 5. Verificar que no tenga ya una sesión activa o aprobada
    const hasActiveOrApproved = activeSessions.some((s: any) =>
      ((s.block_id || s.block?.id) === blockId) &&
      (['requested', 'confirmed', 'rescheduled'].includes(s.status) || (s.status === 'executed' && (s.grade || 0) >= 7))
    );
    if (hasActiveOrApproved) return;

    setCurrentBlockId(blockId);
    setShowGoalModal(true);
  };

  useEffect(() => {
    // Redirection is triggered actively (video end, submit, finalize)
  }, []);

  const loadContent = async (cSlug: string, ctSlug: string) => {
    setIsLoading(true);
    try {
      // Cargar curso y sesiones en paralelo para tener datos frescos
      const [res, tutoringRes] = await Promise.all([
        api.getStudentCourseDetail(cSlug),
        api.getStudentTutoring(),
      ]);

      // Actualizar sesiones con datos frescos
      const freshSessions = tutoringRes.success ? tutoringRes.data : tutoringSessions;
      if (tutoringRes.success) setTutoringSessions(freshSessions);

      if (res.success) {
        const courseData = res.data;
        if (cSlug === courseData.id && courseData.slug) {
          navigate(`/course/${courseData.slug}/content/${ctSlug}`, { replace: true });
          return;
        }

        let foundContent: Content | null = null;

        for (const topic of courseData.topics) {
          const found = topic.contents.find((c: any) => c.slug === ctSlug || c.id === ctSlug);
          if (found) {
            foundContent = found;
            break;
          }
        }

        if (foundContent) {
          if (ctSlug === foundContent.id && foundContent.slug) {
            navigate(`/course/${courseData.slug}/content/${foundContent.slug}`, { replace: true });
            return;
          }
          setContent(foundContent);
          setLastSavedProgress(foundContent.progress.pctWatched || 0);
        }
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleVideoProgress = async (state: any) => {
    if (!content || content.progress.status === 'completed') return;

    const contentId = content.id;
    const currentPct = Math.round((state.played || 0) * 100);
    
    if (currentPct >= lastSavedProgress + 5 || currentPct >= (content.minProgressToComplete || 90)) {
      try {
        setLastSavedProgress(currentPct);
        const res = await api.updateProgress(contentId, currentPct);
        if (res.success && res.data.status === 'completed') {
          const updated = { ...content, progress: { ...content.progress, status: 'completed' } };
          setContent(updated);
          // Recargar curso y sesiones frescos para verificar si es el último del bloque
          const [courseRes, tutoringRes] = await Promise.all([
            api.getStudentCourseDetail(courseSlug!),
            api.getStudentTutoring(),
          ]);
          const freshSessions = tutoringRes.success ? tutoringRes.data : tutoringSessions;
          if (tutoringRes.success) setTutoringSessions(freshSessions);
          if (courseRes.success) {
            const topic = courseRes.data.topics.find((t: any) => t.contents.some((c: any) => c.id === contentId));
            if (topic) {
              checkAndShowTutoringModal(courseRes.data, topic, contentId, freshSessions);
            }
          }
        }
      } catch (e) {
        console.error('Error saving video progress:', e);
      }
    }
  };

  const markAsCompleted = async () => {
    if (!content) return;
    const contentId = content.id;
    try {
      const res = await api.updateProgress(contentId, 100);
      if (res.success) {
        setLastSavedProgress(100);
        const updated = { ...content, progress: { ...content.progress, status: 'completed', pctWatched: 100 } };
        setContent(updated);
        // Recargar curso y sesiones frescos para verificar si es el último del bloque
        const [courseRes, tutoringRes] = await Promise.all([
          api.getStudentCourseDetail(courseSlug!),
          api.getStudentTutoring(),
        ]);
        const freshSessions = tutoringRes.success ? tutoringRes.data : tutoringSessions;
        if (tutoringRes.success) setTutoringSessions(freshSessions);
        if (courseRes.success) {
          const topic = courseRes.data.topics.find((t: any) => t.contents.some((c: any) => c.id === contentId));
          if (topic) {
            checkAndShowTutoringModal(courseRes.data, topic, contentId, freshSessions);
          }
        }
      }
    } catch (e: any) { 
      console.error('Error marking as completed:', e);
    }
  };

  const getCleanVideoUrl = (url: string | null) => {
    if (!url) return '';
    if (url.includes('youtube.com/embed/')) {
      const id = url.split('embed/')[1]?.split('?')[0];
      return `https://www.youtube.com/watch?v=${id}`;
    }
    if (url.includes('player.vimeo.com/video/')) {
      const id = url.split('video/')[1]?.split('?')[0];
      return `https://vimeo.com/${id}`;
    }
    return url;
  };

  // Detecta si la URL es un playback_id de MUX
  // Formato nuevo: "mux:<playbackId>"
  // Formato legacy: alfanumérico sin http (retrocompatibilidad)
  const isMuxPlaybackId = (url: string | null): boolean => {
    if (!url) return false;
    if (url.startsWith('mux:')) return true;
    // Retrocompatibilidad: si no empieza con http/https y es alfanumérico, asumir MUX
    return !url.startsWith('http') && !url.startsWith('/') && /^[a-zA-Z0-9_-]{10,}$/.test(url);
  };

  const getMuxPlaybackId = (url: string): string => {
    if (url.startsWith('mux:')) return url.replace('mux:', '');
    return url; // legacy format
  };

  // Debug: log cuando se carga el contenido
  useEffect(() => {
    if (content?.type === 'video' && content.url) {
      const isMux = isMuxPlaybackId(content.url);
      console.log('[VIDEO]', isMux ? 'MUX' : 'External', content.url);
    }
  }, [content]);

  const handleSubmitChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    const contentId = content.id;
    try {
      await api.submitChallenge(contentId, { gitUrl, comment: comment || undefined });
      const [courseRes, tutoringRes] = await Promise.all([
        api.getStudentCourseDetail(courseSlug!),
        api.getStudentTutoring(),
      ]);
      const freshSessions = tutoringRes.success ? tutoringRes.data : tutoringSessions;
      if (tutoringRes.success) setTutoringSessions(freshSessions);
      if (courseRes.success) {
        const topic = courseRes.data.topics.find((t: any) => t.contents.some((c: any) => c.id === contentId));
        if (topic) {
          const updatedContent = topic.contents.find((c: any) => c.id === contentId);
          if (updatedContent) {
            setContent(updatedContent);
            checkAndShowTutoringModal(courseRes.data, topic, contentId, freshSessions);
          }
        }
      }
    } catch (e: any) { setError(e.response?.data?.message || e.message); }
    finally { setSubmitting(false); }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-900 pt-16 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
    </div>
  );

  if (!content) return (
    <div className="min-h-screen bg-slate-900 pt-16 flex items-center justify-center">
      <p className="text-white">Contenido no encontrado</p>
      {showGoalModal && currentBlockId && (
        <GoalReachedModal 
          onClose={() => setShowGoalModal(false)}
          onConfirm={() => navigate('/meetings', { state: { preselectedBlockId: currentBlockId } })}
        />
      )}
    </div>
  );

  const isCompleted = content.progress.status === 'completed';
  const INPUT = 'w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500';

  return (
    <div className="min-h-screen bg-slate-900 pt-16">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => navigate(`/course/${courseSlug}`)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al Curso
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 bg-red-600/20 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-md border border-red-500/20">
              {content.type === 'video' ? 'VIDEO' : content.type === 'document' ? 'DOCUMENTO' : 'RETO PRÁCTICO'}
            </span>
            {isCompleted && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 uppercase tracking-widest">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Completado
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2 leading-tight">{content.title}</h1>
          {content.description && <p className="text-slate-400 text-lg">{content.description}</p>}
        </div>

        {/* VIDEO */}
        {content.type === 'video' && (
          <div className="mt-6">
            {content.url ? (
              <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6 shadow-2xl relative">
                {isMuxPlaybackId(content.url) ? (
                  <MuxVideoPlayer
                    playbackId={getMuxPlaybackId(content.url!)}
                    title={content.title}
                    startTime={(content.durationMinutes || 0) * 60 * (lastSavedProgress / 100)}
                    onProgress={(pct) => handleVideoProgress({ played: pct / 100 })}
                    onPlay={() => {
                      if (lastSavedProgress === 0) api.updateProgress(content.id, 1);
                    }}
                    onError={(msg) => setError(msg)}
                  />
                ) : (
                  <ReactPlayer
                    url={getCleanVideoUrl(content.url)}
                    width="100%"
                    height="100%"
                    controls
                    onProgress={handleVideoProgress}
                    onError={(e: any) => console.error('ReactPlayer Error:', e)}
                    onStart={() => {
                      if (lastSavedProgress === 0) api.updateProgress(content.id, 1);
                    }}
                    config={{
                      youtube: { playerVars: { showinfo: 0, rel: 0 } },
                      vimeo: { playerOptions: { autopause: true } }
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="aspect-video bg-slate-800 rounded-xl flex items-center justify-center mb-6 border border-slate-700">
                <p className="text-slate-400">URL del video no disponible</p>
              </div>
            )}
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tu Progreso</span>
                  <span className="text-xs font-bold text-red-400">{lastSavedProgress}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden border border-slate-600/30">
                  <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${lastSavedProgress}%` }} />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 italic">
                  * El video se marcará como completado al llegar al {content.minProgressToComplete || 90}% de visualización.
                </p>
              </div>

              {isCompleted && (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-green-500/20 border border-green-500/30 rounded-lg shrink-0">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-400 font-bold text-sm">Completado</span>
                </div>
              )}
            </div>

            {content.supportUrl && (
              <div className="mt-4 p-4 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Material de apoyo</p>
                    <p className="text-xs text-slate-400">Recurso complementario para este video</p>
                  </div>
                </div>
                <a
                  href={content.supportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Abrir material
                </a>
              </div>
            )}
          </div>
        )}

        {/* DOCUMENT */}
        {content.type === 'document' && (
          <div className="mt-6 bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">{content.title}</p>
                <p className="text-sm text-slate-400">Documento de consulta</p>
              </div>
            </div>
            {content.url && (
              <div className="flex gap-3 flex-wrap">
                <a href={content.url} target="_blank" rel="noopener noreferrer"
                  onClick={() => !isCompleted && markAsCompleted()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Abrir documento
                </a>
                {content.allowDownload && (
                  <a href={content.url} download target="_blank" rel="noopener noreferrer"
                    onClick={() => !isCompleted && markAsCompleted()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar
                  </a>
                )}
                {!isCompleted && (
                  <button
                    type="button"
                    onClick={() => markAsCompleted()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Completar documento
                  </button>
                )}
              </div>
            )}
            <p className="text-xs text-slate-500 mt-3">
              {isCompleted ? '✓ Documento revisado' : '* El progreso se marcará automáticamente al abrir el documento.'}
            </p>
          </div>
        )}

        {/* CHALLENGE */}
        {content.type === 'challenge' && (
          <div className="mt-6 space-y-6">
            {content.deadline && (
              <div className={`p-3 rounded-lg border text-sm ${new Date() > new Date(content.deadline) ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
                Fecha límite: {new Date(content.deadline).toLocaleString('es')}
                {new Date() > new Date(content.deadline) && ' — Plazo vencido'}
              </div>
            )}

            {(content.instructions || content.evaluationCriteria) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content.instructions && (
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4">Instrucciones</h3>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{content.instructions}</p>
                  </div>
                )}
                {content.evaluationCriteria && (
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4">Criterios de Evaluación</h3>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{content.evaluationCriteria}</p>
                  </div>
                )}
              </div>
            )}

            {content.url && (
              <div className="flex gap-3">
                <a href={content.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Ver material de apoyo
                </a>
                {content.allowDownload && (
                  <a href={content.url} download target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar material
                  </a>
                )}
              </div>
            )}

            {content.submission ? (
              // Show submission status
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    content.submission.status === 'reviewed' ? 'bg-green-500' :
                    content.submission.status === 'late' ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {content.submission.status === 'reviewed' ? 'Revisado por el tutor' :
                       content.submission.status === 'late' ? 'Entregado fuera de tiempo' : 'Entregado'}
                    </p>
                    <p className="text-sm text-slate-400">{new Date(content.submission.submittedAt).toLocaleString('es')}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Repositorio Git</p>
                    <a href={content.submission.gitUrl} target="_blank" rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm break-all">{content.submission.gitUrl}</a>
                  </div>
                  {content.submission.comment && (
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Comentario</p>
                      <p className="text-sm text-slate-300">{content.submission.comment}</p>
                    </div>
                  )}
                  {content.submission.grade !== null && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Calificación del tutor</p>
                          <p className="text-3xl font-bold text-green-400">{content.submission.grade}/10</p>
                        </div>
                      </div>
                      {content.submission.observations && (
                        <div className="pt-3 border-t border-green-500/20">
                          <p className="text-xs text-slate-400 mb-1">Observaciones</p>
                          <p className="text-sm text-slate-300">{content.submission.observations}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Submit form
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Entregar Reto</h3>
                <form onSubmit={handleSubmitChallenge} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">URL del Repositorio Git *</label>
                    <input type="url" required value={gitUrl} onChange={e => setGitUrl(e.target.value)}
                      placeholder="https://github.com/usuario/repositorio" className={INPUT} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Comentario (opcional)</label>
                    <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
                      placeholder="Agrega notas sobre tu entrega..." className={INPUT} />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    Enviar Reto
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Rate Tutor Modal ── */}
      <Footer />

      {showGoalModal && currentBlockId && (
        <GoalReachedModal 
          onClose={() => setShowGoalModal(false)}
          onConfirm={() => navigate('/meetings', { state: { preselectedBlockId: currentBlockId } })}
        />
      )}

      {/* Modal de Error personalizado */}
      <Modal 
        isOpen={!!error} 
        onClose={() => setError(null)} 
        title="Atención"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-slate-300 text-lg mb-6">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
          >
            Entendido
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ── Meta Cumplida (Formal & Minimalista) ───────────────────────────────────
function GoalReachedModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-all transition-opacity duration-300">
      <div className="bg-[#0f172a] border border-slate-800/50 rounded-3xl max-w-sm w-full p-8 shadow-2xl relative overflow-hidden group">
        {/* Subtle Background Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/15 transition-all duration-700" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Icon - Minimalist troph / check */}
          <div className="w-16 h-16 bg-slate-800/40 rounded-2xl flex items-center justify-center mb-6 border border-slate-700/30">
            <svg className="w-8 h-8 text-blue-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-xl font-medium text-white mb-2 tracking-tight">Bloque Completado</h2>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed max-w-[240px]">
            Has completado todos los requisitos de avance para este nivel académico.
          </p>

          <div className="w-full space-y-3">
            <button 
              onClick={onConfirm}
              className="w-full py-4 bg-white text-slate-950 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all flex items-center justify-center gap-2 group/btn"
            >
              SOLICITAR TUTORÍA AHORA
              <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button 
              onClick={onClose}
              className="w-full py-2 text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors"
            >
              Continuar más tarde
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
