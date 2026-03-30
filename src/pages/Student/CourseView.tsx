import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayerImport from 'react-player';
const ReactPlayer = ReactPlayerImport as any;
import { api } from '../../services/api';
import Footer from '../../components/Footer';

interface Content {
  id: string;
  type: 'video' | 'document' | 'challenge';
  title: string;
  description: string | null;
  url: string | null;
  slug: string | null;
  order: number;
  durationMinutes: number | null;
  deadline: string | null;
  allowDownload: boolean;
  progress: { status: string; pctWatched: number; completedAt: string | null };
  submission: any | null;
}

interface Topic {
  id: string;
  title: string;
  description: string | null;
  order: number;
  blockId: string | null;
  blockName: string | null;
  contents: Content[];
}

interface CourseDetail {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  tutors: any[];
  topics: Topic[];
  blocks: any[];
  progress: { total: number; completed: number; pct: number };
}

interface TutoringSession {
  id: string;
  block_id: string;
  status: 'requested' | 'confirmed' | 'rescheduled' | 'cancelled' | 'executed';
  grade: number | null;
  scheduled_at: string | null;
}

export default function CourseView() {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tutoringSessions, setTutoringSessions] = useState<TutoringSession[]>([]);
  
  // States for content logic
  const [submittingChallenge, setSubmittingChallenge] = useState(false);
  const [gitUrl, setGitUrl] = useState('');
  const [comment, setComment] = useState('');
  const [lastSavedProgress, setLastSavedProgress] = useState(0);
  const [markingDone, setMarkingDone] = useState(false);

  useEffect(() => {
    if (courseSlug) {
      loadCourse(courseSlug);
      loadTutoring();
    }
  }, [courseSlug]);

  const loadTutoring = async () => {
    try {
      const res = await api.getStudentTutoring();
      if (res.success) setTutoringSessions(res.data);
    } catch (e) { console.error(e); }
  };

  const loadCourse = async (idOrSlug: string) => {
    setIsLoading(true);
    try {
      const res = await api.getStudentCourseDetail(idOrSlug);
      if (res.success) {
        const courseData = res.data;
        // Si entramos por ID pero tenemos un slug, redirigimos a la URL amigable
        if (idOrSlug === courseData.id && courseData.slug) {
          navigate(`/course/${courseData.slug}`, { replace: true });
          return;
        }
        setCourse(courseData);
        if (courseData.topics.length > 0) setSelectedTopicId(courseData.topics[0].id);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-900 pt-16 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
    </div>
  );

  if (!course) return (
    <div className="min-h-screen bg-slate-900 pt-16 flex items-center justify-center">
      <p className="text-white">Curso no encontrado</p>
    </div>
  );

  const selectedTopic = course.topics.find(t => t.id === selectedTopicId);
  const selectedContent = selectedTopic?.contents.find(c => c.id === selectedContentId);
  
  const blockSessions = selectedTopic?.blockId 
    ? tutoringSessions.filter(s => s.block_id === selectedTopic.blockId) 
    : [];
  const activeSession = blockSessions.find(s => ['requested', 'confirmed', 'rescheduled'].includes(s.status));
  const currentBlock = course.blocks?.find(b => b.id === selectedTopic?.blockId);

  // Lógica de habilitación de tutoría (13.2)
  const canRequestTutoring = () => {
    if (!currentBlock) return false;
    const blockTopics = course.topics.filter(t => t.blockId === currentBlock.id);
    const totalBlockContents = blockTopics.reduce((acc, t) => acc + t.contents.length, 0);
    const completedBlockContents = blockTopics.reduce((acc, t) => acc + t.contents.filter(c => c.progress.status === 'completed').length, 0);
    const actualBlockProgress = (completedBlockContents / totalBlockContents) * 100;
    
    return actualBlockProgress >= currentBlock.expectedProgress;
  };

  const getCleanVideoUrl = (url: string | null) => {
    if (!url) return '';
    
    // Si ya es una URL limpia, no hacemos nada
    if (url.includes('youtube.com/watch?v=') || url.includes('vimeo.com/')) return url;

    // Convertir embed a watch (YouTube)
    if (url.includes('youtube.com/embed/') || url.includes('youtu.be/')) {
      const id = url.includes('embed/') 
        ? url.split('embed/')[1]?.split('?')[0]
        : url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/watch?v=${id}`;
    }

    // Convertir embed a normal (Vimeo)
    if (url.includes('player.vimeo.com/video/')) {
      const id = url.split('video/')[1]?.split('?')[0];
      return `https://vimeo.com/${id}`;
    }

    // Si detectamos YouTube pero no tiene el formato correcto
    if (url.includes('youtube.com') && !url.includes('watch?v=')) {
        const urlParams = new URL(url);
        const v = urlParams.searchParams.get('v');
        if (v) return `https://www.youtube.com/watch?v=${v}`;
    }

    return url;
  };

  const handleVideoProgress = async (state: { played: number }) => {
    if (!selectedContent || selectedContent.progress.status === 'completed') return;
    const currentPct = Math.round(state.played * 100);
    if (currentPct >= lastSavedProgress + 5 || currentPct >= 90) {
      try {
        setLastSavedProgress(currentPct);
        const res = await api.updateProgress(selectedContent.id, currentPct);
        if (res.success && res.data.status === 'completed' && courseSlug) {
           loadCourse(courseSlug);
        }
      } catch (e) { console.error(e); }
    }
  };

  const handleManualComplete = async () => {
    if (!selectedContent) return;
    setMarkingDone(true);
    try {
      await api.updateProgress(selectedContent.id, 100);
      if (courseSlug) await loadCourse(courseSlug);
    } catch (e) { console.error(e); }
    finally { setMarkingDone(false); }
  };

  const handleSubmitChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContent) return;
    setSubmittingChallenge(true);
    try {
      await api.submitChallenge(selectedContent.id, { gitUrl, comment });
      navigate('/meetings', { state: { preselectedBlockId: selectedTopic?.blockId } });
    } catch (e: any) { alert(e.response?.data?.message || e.message); }
    finally { setSubmittingChallenge(false); }
  };

  const handleRequestTutoring = async () => {
    if (!selectedTopic?.blockId) return;
    try {
      const res = await api.requestTutoring(selectedTopic.blockId);
      if (res.success) {
        loadTutoring();
        alert('Tutoría solicitada con éxito. Revisa tu panel de tutorías.');
      }
    } catch (e: any) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const getContentStatus = (c: Content) => {
    if (c.progress.status === 'completed') {
      if (c.type === 'challenge' && c.submission) {
        const grade = c.submission.grade ?? 0;
        return grade >= 7 ? 'completed' : 'failed';
      }
      return 'completed';
    }
    if (c.submission) return 'submitted';
    return 'pending';
  };

  // Lógica de bloqueo secuencial
  const getFlattenedContents = () => {
    if (!course) return [];
    return course.topics
      .sort((a, b) => a.order - b.order)
      .flatMap(topic => topic.contents.sort((a, b) => a.order - b.order));
  };

  const isContentLocked = (contentId: string) => {
    if (!course) return true;
    const flat = getFlattenedContents();
    const idx = flat.findIndex(c => c.id === contentId);
    
    // El primero siempre está desbloqueado
    if (idx === 0) return false;
    
    // Un contenido está bloqueado si el anterior NO está satisfactoriamente completado
    const prev = flat[idx - 1];
    const prevStatus = getContentStatus(prev);
    
    return prevStatus !== 'completed';
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-84 bg-slate-800 border-r border-slate-700 overflow-y-auto flex-shrink-0 hidden md:flex flex-col">
        <div className="p-5 flex-1">
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Dashboard
          </button>
          
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white mb-2 leading-tight">{course.name}</h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 rounded-full transition-all duration-500"
                  style={{ width: `${course.progress.pct}%` }} />
              </div>
              <span className="text-[10px] font-bold text-slate-400">{Math.round(course.progress.pct)}%</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-4 px-1">Curriculum</p>
          <div className="space-y-4">
            {course.topics.map(topic => {
              const completed = topic.contents.filter(c => c.progress.status === 'completed').length;
              const isTopicActive = selectedTopicId === topic.id;
              
              return (
                <div key={topic.id} className="space-y-1">
                  <button onClick={() => {
                    setSelectedTopicId(topic.id);
                    if (!isTopicActive && topic.contents.length > 0) {
                      setSelectedContentId(null);
                    }
                  }}
                    className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center justify-between group ${isTopicActive ? 'bg-slate-700/50 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className={`text-[10px] font-black w-5 h-5 rounded flex items-center justify-center border-2 ${isTopicActive ? 'border-red-500 text-red-500' : 'border-slate-700 text-slate-600'}`}>
                        {topic.order}
                      </span>
                      <p className="text-xs font-bold truncate uppercase tracking-wide">{topic.title}</p>
                    </div>
                    <span className="text-[9px] font-bold opacity-50">{completed}/{topic.contents.length}</span>
                  </button>

                  {(isTopicActive || true) && (
                    <div className="ml-8 space-y-1 border-l-2 border-slate-700/50 pl-3 py-1">
                      {topic.contents.map(content => {
                        const isContentActive = selectedContentId === content.id;
                        const status = getContentStatus(content);
                        const locked = isContentLocked(content.id);

                        return (
                          <button key={content.id} 
                            disabled={locked}
                            onClick={() => {
                              setSelectedTopicId(topic.id);
                              setSelectedContentId(content.id);
                              setLastSavedProgress(content.progress.pctWatched || 0);
                            }}
                            className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                              locked ? 'opacity-40 cursor-not-allowed filter grayscale' : 
                              isContentActive ? 'bg-red-600/10 text-red-500 border border-red-500/20' : 
                              'text-slate-500 hover:text-slate-300 hover:bg-slate-700/30'
                            }`}>
                            {locked ? (
                               <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                               </svg>
                            ) : status === 'completed' ? (
                               <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                               </svg>
                            ) : status === 'failed' ? (
                               <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                               </svg>
                            ) : (
                               <div className={`w-3 h-3 rounded-full border-2 ${isContentActive ? 'border-red-500' : 'border-slate-700'}`} />
                            )}
                            <span className="truncate">{content.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-slate-900/50 flex flex-col">
        {selectedContent ? (
          <div className="max-w-5xl w-full mx-auto p-6 md:p-10 flex-1">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 bg-red-600/10 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded border border-red-500/20">
                      {selectedContent.type === 'video' ? 'Video' : selectedContent.type === 'document' ? 'Documento' : 'Reto'}
                    </span>
                    {selectedContent.progress.status === 'completed' && (
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        Completado
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-extrabold text-white leading-tight">{selectedContent.title}</h1>
                </div>
                
                {selectedTopic?.blockId && currentBlock && (
                  <div className="flex flex-col items-end gap-2">
                    {activeSession ? (
                      <div className="px-4 py-2 bg-orange-500/10 text-orange-500 rounded-xl border border-orange-500/20 text-xs font-bold uppercase tracking-tighter">
                        Tutoría {activeSession.status}
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        {!canRequestTutoring() && (
                          <span className="text-[10px] font-bold text-amber-500 mb-1 animate-pulse">
                            Necesitas {currentBlock.expectedProgress}% de avance en este bloque
                          </span>
                        )}
                        <button 
                          disabled={!canRequestTutoring()}
                          onClick={handleRequestTutoring} 
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
                            canRequestTutoring() 
                              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' 
                              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          Solicitar Tutoría
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* VIEWERS */}
              {selectedContent.type === 'video' && (
                <div className="space-y-6">
                  {selectedContent.url ? (
                    <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative">
                      <ReactPlayer
                        key={getCleanVideoUrl(selectedContent.url)}
                        url={getCleanVideoUrl(selectedContent.url)}
                        width="100%"
                        height="100%"
                        controls
                        onProgress={handleVideoProgress}
                        onError={(e: any) => console.error('ReactPlayer Error:', e)}
                        onStart={() => {
                          if (lastSavedProgress === 0) api.updateProgress(selectedContent.id, 1);
                        }}
                        config={{
                          youtube: { playerVars: { showinfo: 0, rel: 0 } },
                          vimeo: { playerOptions: { autopause: true } }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
                      <p className="text-slate-400">URL del video no disponible</p>
                    </div>
                  )}
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 w-full">
                       <div className="flex justify-between mb-2"><span className="text-[10px] font-bold text-slate-500 uppercase">Tu Avance</span><span className="text-xs font-bold text-red-500">{lastSavedProgress}%</span></div>
                       <div className="h-2 bg-slate-900 rounded-full overflow-hidden shrink-0">
                         <div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${lastSavedProgress}%` }} />
                       </div>
                    </div>
                    {selectedContent.progress.status !== 'completed' && (
                      <button onClick={handleManualComplete} disabled={markingDone} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2">
                        {markingDone && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Terminé de ver
                      </button>
                    )}
                  </div>
                </div>
              )}

              {selectedContent.type === 'document' && (
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center space-y-6">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto">
                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">{selectedContent.title}</h2>
                  <div className="flex justify-center gap-4">
                    <a href={selectedContent.url || '#'} target="_blank" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all">Abrir Documento</a>
                    {selectedContent.allowDownload && <a href={selectedContent.url || '#'} download className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all">Descargar</a>}
                  </div>
                </div>
              )}

              {selectedContent.type === 'challenge' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                       <h3 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4">Instrucciones</h3>
                       <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedContent.description || 'Sin instrucciones adicionales'}</p>
                    </div>
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                       <h3 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4">Material de Apoyo</h3>
                       {selectedContent.url ? (
                         <a href={selectedContent.url} target="_blank" className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl hover:bg-slate-900 transition-colors text-slate-300">
                           <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4" /></svg>
                           <span className="text-xs font-bold uppercase">Ver Recursos</span>
                         </a>
                       ) : <p className="text-xs text-slate-500 italic">No hay archivos adjuntos</p>}
                    </div>
                  </div>

                  {selectedContent.submission ? (
                    <div className="bg-slate-800 p-8 rounded-2xl border border-green-500/20 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest border-l border-b border-green-500/20 rounded-bl-xl">Entregado</div>
                       <h3 className="text-lg font-bold text-white mb-6">Tu Entrega</h3>
                       <div className="space-y-4">
                         <div className="p-4 bg-slate-900 rounded-xl border border-slate-700">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Repositorio</label>
                            <a href={selectedContent.submission.gitUrl} target="_blank" className="text-sm text-blue-400 font-medium break-all">{selectedContent.submission.gitUrl}</a>
                         </div>
                         {selectedContent.submission.comment && (
                           <div className="p-4 bg-slate-900 rounded-xl border border-slate-700">
                              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Comentario</label>
                              <p className="text-sm text-slate-300">{selectedContent.submission.comment}</p>
                           </div>
                         )}
                       </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitChallenge} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 space-y-6">
                      <h3 className="text-xl font-bold text-white">Entregar Reto</h3>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">URL del Repositorio (GitHub/GitLab)</label>
                        <input type="url" required value={gitUrl} onChange={e => setGitUrl(e.target.value)} placeholder="https://github.com/tu-usuario/proyecto" className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Comentario (opcional)</label>
                        <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder="Notas para tu tutor..." className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50" />
                      </div>
                      <button type="submit" disabled={submittingChallenge} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-red-900/20 flex items-center justify-center gap-3">
                        {submittingChallenge && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Confirmar Entrega
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full relative">
            {course.imageUrl ? (
              <img 
                src={course.imageUrl} 
                alt={course.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center">
                <svg className="w-32 h-32 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-10">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-lg">{course.name}</h1>
              {course.description && (
                <p className="text-slate-300 text-base max-w-2xl mb-4">{course.description}</p>
              )}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-white text-sm font-bold">{Math.round(course.progress.pct)}% completado</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-white text-sm font-bold">{course.topics.length} temas</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
}
