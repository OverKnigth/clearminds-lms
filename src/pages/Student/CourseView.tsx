import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayerImport from 'react-player';
const ReactPlayer = ReactPlayerImport as any;
import { api } from '../../services/api';
import Footer from '../../components/Footer';
import { StudentBadges } from './components';
import { useDialog } from '../../hooks/useDialog';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import MuxPlayer from '@mux/mux-player-react';

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
  submission: {
    id: string;
    gitUrl: string;
    comment: string | null;
    submittedAt: string | null;
    status: string;
    grade: number | null;
    observations: string | null;
    tutoring: {
      id: string;
      tutorName: string;
      rating: number | null;
      feedback: string | null;
    } | null;
    attempts?: {
      attemptNumber: number;
      gitUrl: string;
      comment: string | null;
      status: string;
      grade: number | null;
      observations: string | null;
      tutorRating: number | null;
      tutorFeedback: string | null;
      gradedByTutor: {
        names: string;
        lastNames: string;
      } | null;
    }[];
  } | null;
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
  badges: any[];
  progress: { total: number; completed: number; pct: number };
}

interface TutoringSession {
  id: string;
  block_id?: string;
  block?: { id: string; name: string; course: { id: string; name: string } };
  status: 'requested' | 'confirmed' | 'rescheduled' | 'cancelled' | 'executed';
  grade: number | null;
  scheduled_at: string | null;
  executed_at?: string | null;
  attempt_number: number;
  observations?: string | null;
}

export default function CourseView() {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [showBadges, setShowBadges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tutoringSessions, setTutoringSessions] = useState<TutoringSession[]>([]);

  // States for content logic
  const [submittingChallenge, setSubmittingChallenge] = useState(false);
  const [gitUrl, setGitUrl] = useState('');
  const [comment, setComment] = useState('');
  const [lastSavedProgress, setLastSavedProgress] = useState(0);
  const lastReportedPctRef = useRef(0);
  const [_markingDone] = useState(false);
  const [tutorRating, setTutorRating] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [pendingRatingSubmission, setPendingRatingSubmission] = useState<{ id: string; tutorName: string } | null>(null);
  const [showTutoringModal, setShowTutoringModal] = useState(false);
  const [tutoringObservation, setTutoringObservation] = useState('');
  const [tutoringDate, setTutoringDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [requestingTutoring, setRequestingTutoring] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [newBadge, setNewBadge] = useState<any | null>(null);
  const seenBadgeIds = useRef<Set<string> | null>(null);
  const { dialog, showAlert, close: closeDialog } = useDialog();

  useEffect(() => {
    if (courseSlug) {
      loadCourse(courseSlug);
      loadTutoring();
    }
  }, [courseSlug]);

  // Auto-show rating modal 5 seconds after viewing a graded challenge
  useEffect(() => {
    if (!course || !selectedTopicId || !selectedContentId) return;
    
    const topic = course.topics.find(t => t.id === selectedTopicId);
    const content = topic?.contents.find(c => c.id === selectedContentId);

    if (content?.type === 'challenge' && content.submission?.tutoring && content.submission.grade !== null && !content.submission.tutoring.rating) {
      const submissionId = content.submission.tutoring.id;
      const tutorName = content.submission.tutoring.tutorName;

      const timer = setTimeout(() => {
        setPendingRatingSubmission({ id: submissionId, tutorName });
        setShowRatingModal(true);
        setTutorRating(0);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [course, selectedTopicId, selectedContentId]);

  // Detect newly earned badges
  useEffect(() => {
    if (!course?.badges) return;
    const currentEarned = course.badges.filter((b: any) => b.state === 'earned');

    // First run initialization (don't alert for already earned badges on load)
    if (seenBadgeIds.current === null) {
      seenBadgeIds.current = new Set(currentEarned.map((b: any) => b.id));
      return;
    }

    const newlyEarned = currentEarned.filter((b: any) => !seenBadgeIds.current!.has(b.id));
    if (newlyEarned.length > 0) {
      setNewBadge(newlyEarned[0]);
      newlyEarned.forEach((b: any) => seenBadgeIds.current!.add(b.id));
    }
  }, [course?.badges]);

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

  // Recarga silenciosa — sin spinner, para actualizar datos tras acciones del usuario
  const reloadCourse = async (idOrSlug: string) => {
    try {
      const res = await api.getStudentCourseDetail(idOrSlug);
      if (res.success) setCourse(res.data);
    } catch (e) { console.error(e); }
  };

  // Actualiza el progreso de un contenido localmente sin recargar el curso completo
  const markContentCompleted = (contentId: string) => {
    setCourse(prev => {
      if (!prev) return prev;
      const completed = prev.progress.completed + 1;
      const pct = prev.progress.total > 0 ? Math.round((completed / prev.progress.total) * 100) : 0;
      return {
        ...prev,
        progress: { ...prev.progress, completed, pct },
        topics: prev.topics.map(t => ({
          ...t,
          contents: t.contents.map(c =>
            c.id === contentId
              ? { ...c, progress: { status: 'completed', pctWatched: 100, completedAt: new Date().toISOString() } }
              : c
          )
        }))
      };
    });
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
    ? tutoringSessions.filter(s => (s.block_id ?? s.block?.id) === selectedTopic.blockId)
    : [];
  const activeSession = blockSessions.find(s => ['requested', 'confirmed', 'rescheduled'].includes(s.status));
  const currentBlock = course.blocks?.find(b => b.id === selectedTopic?.blockId);

  // Lógica de habilitación de tutoría (13.2)
  // canRequestTutoring — available for future use

  // handleManualComplete — available for future use
  const getYouTubeId = (url: string): string | null => {
    if (!url) return null;
    // youtu.be/ID
    const shortMatch = url.match(/youtu\.be\/([^?&/]+)/);
    if (shortMatch) return shortMatch[1];
    // youtube.com/watch?v=ID
    const watchMatch = url.match(/[?&]v=([^?&/]+)/);
    if (watchMatch) return watchMatch[1];
    // youtube.com/embed/ID
    const embedMatch = url.match(/youtube\.com\/embed\/([^?&/]+)/);
    if (embedMatch) return embedMatch[1];
    // youtube.com/shorts/ID
    const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&/]+)/);
    if (shortsMatch) return shortsMatch[1];
    return null;
  };

  const getVimeoId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
  };

  const getCleanVideoUrl = (url: string | null) => {
    if (!url) return '';
    if (url.startsWith('mux:')) {
      const muxId = url.replace('mux:', '');
      return `https://stream.mux.com/${muxId}.m3u8`;
    }
    const ytId = getYouTubeId(url);
    if (ytId) return `https://www.youtube.com/watch?v=${ytId}`;
    const vimeoId = getVimeoId(url);
    if (vimeoId) return `https://vimeo.com/${vimeoId}`;
    return url;
  };

  const handleVideoProgress = async (state: { played: number }) => {
    if (!selectedContent || selectedContent.progress.status === 'completed') return;
    const currentPct = Math.round(state.played * 100);
    
    // Evitar llamadas en loop si ya reportamos el mismo % o cruzamos 90
    if (currentPct >= 90 && lastReportedPctRef.current >= 90) return;
    
    if (currentPct >= lastReportedPctRef.current + 5 || currentPct >= 90) {
      try {
        lastReportedPctRef.current = currentPct;
        setLastSavedProgress(currentPct);
        const res = await api.updateProgress(selectedContent.id, currentPct);
        if (res.success && res.data.status === 'completed') {
          markContentCompleted(selectedContent.id);
        }
      } catch (e) { console.error(e); }
    }
  };

  const handleYouTubeProgress = async (contentId: string, pct: number) => {
    if (!selectedContent || selectedContent.progress.status === 'completed') return;
    try {
      const res = await api.updateProgress(contentId, pct);
      if (res.success && res.data.status === 'completed') {
        markContentCompleted(contentId);
      }
    } catch (e) { console.error(e); }
  };

  // handleManualComplete — available for future use

  const handleSubmitChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContent || !selectedTopic) return;
    setSubmittingChallenge(true);
    try {
      await api.submitChallenge(selectedContent.id, { gitUrl, comment });
      
      // Identificar si es el último reto del bloque
      const challenges = selectedTopic.contents.filter(c => c.type === 'challenge').sort((a, b) => a.order - b.order);
      const isLastChallenge = challenges.length > 0 && challenges[challenges.length - 1].id === selectedContent.id;

      if (isLastChallenge) {
        // Forzar solicitud de tutoría para el último reto
        openTutoringModal();
      } else {
        navigate('/meetings', { state: { preselectedBlockId: selectedTopic?.blockId } });
      }
    } catch (e: any) { showAlert(e.response?.data?.message || e.message); }
    finally { setSubmittingChallenge(false); }
  };

  const handleDocumentClick = async (contentId: string) => {
    try {
      const res = await api.updateProgress(contentId, 100);
      if (res.success) {
        markContentCompleted(contentId);
      }
    } catch (e) { console.error('Error marking document as completed:', e); }
  };

  const handleRateTutor = async (submissionId: string, rating: number) => {
    setRatingSubmitting(true);
    try {
      await api.rateTutorFromChallenge(submissionId, rating);
      setShowRatingModal(false);
      setPendingRatingSubmission(null);
      setTutorRating(0);
      if (courseSlug) {
        // Snapshot badges before reload to detect newly earned ones
        const badgesBefore = new Set(
          (course?.badges ?? []).filter((b: any) => b.state === 'earned').map((b: any) => b.id)
        );
        seenBadgeIds.current = badgesBefore;
        await reloadCourse(courseSlug);
      }
    } catch (e: any) { showAlert(e.response?.data?.message || e.message); }
    finally { setRatingSubmitting(false); }
  };

  const handleRequestTutoring = async () => {
    if (!selectedTopic?.blockId) return;
    setRequestingTutoring(true);
    try {
      const isoDate = new Date(tutoringDate).toISOString();
      await (api as any).requestTutoring(selectedTopic.blockId, tutoringObservation || undefined, isoDate);
      setShowTutoringModal(false);
      setTutoringObservation('');
      loadTutoring();
    } catch (e: any) {
      showAlert(e.response?.data?.message || e.message);
    } finally {
      setRequestingTutoring(false);
    }
  };

  const openTutoringModal = () => {
    setTutoringObservation('');
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setTutoringDate(now.toISOString().slice(0, 16));
    setShowTutoringModal(true);
  };

  const getContentStatus = (c: Content) => {
    if (c.progress.status === 'completed' || c.submission) {
      return 'completed';
    }
    if (c.submission) return 'submitted';
    return 'pending';
  };

  // Per spec 13.10 (revised): a failed challenge ONLY unlocks subsequent content
  // if the student has ALREADY rescheduled — i.e. there is an active tutoring session
  // (requested / confirmed / rescheduled) for that block.
  // A past executed session with a failing grade does NOT unlock — the student must
  // explicitly request a new tutoring first.
  const isContentUnlockedForProgress = (c: Content): boolean => {
    const status = getContentStatus(c);
    if (status === 'completed' || status === 'submitted') return true;
    return false;
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

    // Un contenido está bloqueado si el anterior no está completado
    // (pero un challenge con tutoría activa/pendiente no bloquea el siguiente)
    const prev = flat[idx - 1];
    return !isContentUnlockedForProgress(prev);
  };

  return (
    <>
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
              {/* Badges Link */}
              <button
                onClick={() => {
                  setShowBadges(true);
                  setSelectedTopicId(null);
                  setSelectedContentId(null);
                }}
                className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center justify-between group ${showBadges ? 'bg-red-600/20 text-red-500 border border-red-500/30 shadow-lg shadow-red-900/10' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 flex items-center justify-center rounded border-2 ${showBadges ? 'border-red-500 bg-red-500/10' : 'border-slate-700'}`}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wide">Mis Insignias</p>
                </div>
                <span className="text-[10px] font-bold opacity-50">
                  {course.badges?.filter((b: any) => b.state === 'earned').length || 0}/{course.badges?.length || 0}
                </span>
              </button>

              {course.topics.map(topic => {
                const completed = topic.contents.filter(c => c.progress.status === 'completed').length;
                const isTopicActive = selectedTopicId === topic.id;

                return (
                  <div key={topic.id} className="space-y-1">
                    <button onClick={() => {
                      setShowBadges(false);
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
                          // Check if this failed challenge has an active tutoring (spec 13.10)
                          // hasPendingTutoring check omitted — status 'failed' not in type
                          return (
                            <button key={content.id}
                              disabled={locked}
                              onClick={() => {
                                setShowBadges(false);
                                setSelectedTopicId(topic.id);
                                setSelectedContentId(content.id);
                                const initPct = content.progress.pctWatched || 0;
                                setLastSavedProgress(initPct);
                                lastReportedPctRef.current = initPct;
                                setIsResubmitting(false);
                              }}
                              className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${locked ? 'opacity-40 cursor-not-allowed filter grayscale' :
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
          {showBadges && course ? (
            <div className="max-w-6xl w-full mx-auto p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="mb-10">
                <h1 className="text-4xl font-black text-white mb-2">Colección del Curso</h1>
                <p className="text-slate-400">Gana insignias exclusivas al completar los hitos de {course.name}</p>
              </div>

              <StudentBadges badges={course.badges || []} />

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
                  <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <h4 className="text-white font-bold mb-1 uppercase tracking-tighter text-xs">Bloqueada</h4>
                  <p className="text-[10px] text-slate-500">Aún no alcanzas el avance mínimo requerido para este bloque.</p>
                </div>
                <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h4 className="text-white font-bold mb-1 uppercase tracking-tighter text-xs">Disponible por obtener</h4>
                  <p className="text-[10px] text-slate-500">¡Meta de avance cumplida! Aprueba tu tutoría para reclamarla.</p>
                </div>
                <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
                  <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h4 className="text-white font-bold mb-1 uppercase tracking-tighter text-xs">Obtenida</h4>
                  <p className="text-[10px] text-slate-500">Logro desbloqueado y visible en tu perfil público.</p>
                </div>
              </div>
            </div>
          ) : selectedContent ? (
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


                </div>

                {/* Block tutoring status banner — spec 13.10 */}
                {selectedTopic?.blockId && (() => {
                  const blockSess = tutoringSessions.filter(
                    s => (s.block_id ?? s.block?.id) === selectedTopic.blockId
                  );
                  const pending = blockSess.find(s => ['requested', 'confirmed', 'rescheduled'].includes(s.status));
                  const lastExecuted = blockSess
                    .filter(s => s.status === 'executed')
                    .sort((a, b) => (b.attempt_number ?? 0) - (a.attempt_number ?? 0))[0];
                  const isApproved = lastExecuted && lastExecuted.grade !== null && lastExecuted.grade >= 7;
                  const isFailed = lastExecuted && lastExecuted.grade !== null && lastExecuted.grade < 7 && !pending;

                  if (isApproved) return (
                    <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-green-400 font-bold uppercase tracking-widest">Bloque aprobado — insignia desbloqueada</p>
                    </div>
                  );

                  if (pending) return (
                    <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <svg className="w-4 h-4 text-blue-400 shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Tutoría en espera de confirmación</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Puedes seguir avanzando. La insignia se entregará cuando el tutor apruebe este bloque.</p>
                      </div>
                    </div>
                  );

                  if (isFailed) return (
                    <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">Bloque no aprobado — reagenda tu tutoría</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Puedes seguir avanzando, pero la insignia estará bloqueada hasta aprobar.</p>
                      </div>
                    </div>
                  );

                  return null;
                })()}

                {/* VIEWERS */}
                {selectedContent.type === 'video' && (
                  <div className="space-y-6">
                    {selectedContent.url ? (
                      <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative">
                        {selectedContent.url?.startsWith('mux:') ? (
                          <MuxPlayer
                            playbackId={selectedContent.url.replace('mux:', '')}
                            metadata={{ video_id: selectedContent.id, video_title: selectedContent.title }}
                            className="w-full h-full"
                            onTimeUpdate={(e: any) => {
                              const el = e.target;
                              if (el && el.duration > 0) {
                                handleVideoProgress({ played: el.currentTime / el.duration });
                              }
                            }}
                            onPlay={() => {
                              if (lastSavedProgress === 0) api.updateProgress(selectedContent.id, 1);
                            }}
                          />
                        ) : getYouTubeId(selectedContent.url) ? (
                          /* YouTube — IFrame API para rastrear progreso real */
                          <YouTubePlayer
                            videoId={getYouTubeId(selectedContent.url)!}
                            onProgress={(pct) => {
                              setLastSavedProgress(pct);
                              handleYouTubeProgress(selectedContent.id, pct);
                            }}
                            onStart={() => {
                              if (lastSavedProgress === 0) api.updateProgress(selectedContent.id, 1);
                            }}
                            initialProgress={selectedContent.progress.pctWatched || 0}
                          />
                        ) : (
                          /* Vimeo / otros — ReactPlayer */
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
                              vimeo: { playerOptions: { autopause: true } }
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
                        <p className="text-slate-400">URL del video no disponible</p>
                      </div>
                    )}
                    {/* Indicador de completado automático */}
                    {selectedContent.progress.status === 'completed' && (
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Video completado</span>
                      </div>
                    )}
                  </div>
                )}

                {selectedContent.type === 'document' && (
                  <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center space-y-6">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto">
                      <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">{selectedContent.title}</h2>
                    <div className="flex justify-center gap-4">
                      <a 
                        href={selectedContent.url || '#'} 
                        target="_blank" 
                        onClick={() => handleDocumentClick(selectedContent.id)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all"
                      >
                        Abrir Documento
                      </a>
                      {selectedContent.allowDownload && (
                        <a 
                          href={selectedContent.url || '#'} 
                          download 
                          onClick={() => handleDocumentClick(selectedContent.id)}
                          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all"
                        >
                          Descargar
                        </a>
                      )}
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

                    {selectedContent.submission && !isResubmitting ? (
                      <div className="bg-slate-800 p-8 rounded-2xl border border-green-500/20 relative overflow-hidden space-y-4">
                        <div className="absolute top-0 right-0 p-4 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest border-l border-b border-green-500/20 rounded-bl-xl">Entregado</div>
                        <h3 className="text-lg font-bold text-white">Tu Entrega</h3>

                        {/* Repo & comment */}
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

                        {/* Tutor grade & observations */}
                        {selectedContent.submission.grade !== null && (
                          <div className={`p-4 rounded-xl border ${selectedContent.submission.grade >= 7 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calificación del Tutor</label>
                              <div className="flex items-center gap-2">
                                <span className={`text-2xl font-black ${selectedContent.submission.grade >= 7 ? 'text-green-400' : 'text-red-400'}`}>
                                  {selectedContent.submission.grade}/10
                                </span>
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${selectedContent.submission.grade >= 7 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                  {selectedContent.submission.grade >= 7 ? '✓ Aprobado' : '✗ No aprobado'}
                                </span>
                              </div>
                            </div>
                            {selectedContent.submission.observations && (
                              <p className="text-sm text-slate-300 mt-2 italic">"{selectedContent.submission.observations}"</p>
                            )}
                            {selectedContent.submission.tutoring?.tutorName && (
                              <p className="text-[10px] text-slate-500 mt-1">— {selectedContent.submission.tutoring.tutorName}</p>
                            )}
                          </div>
                        )}

                        {/* Reagendar button — when not approved and no active session */}
                        {selectedContent.submission.grade !== null &&
                          selectedContent.submission.grade < 7 &&
                          !activeSession &&
                          selectedTopic?.blockId &&
                          !blockSessions.some(s => s.status === 'executed' && s.grade !== null && s.grade >= 7) && (
                            <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-xl space-y-3">
                              <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-black text-white mb-0.5">Bloque no aprobado</p>
                                  <p className="text-xs text-slate-400">Puedes solicitar una nueva tutoría para volver a presentar este bloque.</p>
                                </div>
                              </div>
                              <button
                                onClick={openTutoringModal}
                                className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Reagendar Tutoría
                              </button>
                            </div>
                          )}

                        {/* Historial de intentos del bloque */}
                        {selectedTopic?.blockId && blockSessions.filter(s => s.status === 'executed').length > 0 && (
                          <div className="border border-slate-700 rounded-xl overflow-hidden">
                            <div className="px-4 py-2.5 bg-slate-700/30 border-b border-slate-700">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historial de Intentos</p>
                            </div>
                            <table className="w-full text-xs">
                              <thead className="bg-slate-800/50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">#</th>
                                  <th className="px-3 py-2 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Fecha</th>
                                  <th className="px-3 py-2 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest">Nota</th>
                                  <th className="px-3 py-2 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-700/50">
                                {blockSessions
                                  .filter(s => s.status === 'executed')
                                  .sort((a, b) => a.attempt_number - b.attempt_number)
                                  .map(s => (
                                    <tr key={s.id} className="hover:bg-slate-700/20">
                                      <td className="px-3 py-2 text-slate-400 font-bold">{s.attempt_number}</td>
                                      <td className="px-3 py-2 text-slate-400">{s.executed_at ? new Date(s.executed_at).toLocaleDateString('es-ES') : '—'}</td>
                                      <td className="px-3 py-2 text-center">
                                        <span className={`font-black ${s.grade !== null ? (s.grade >= 7 ? 'text-green-400' : 'text-red-400') : 'text-slate-500'}`}>
                                          {s.grade !== null ? `${s.grade}/10` : '—'}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${s.grade !== null ? (s.grade >= 7 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400') : 'bg-slate-700 text-slate-500'}`}>
                                          {s.grade !== null ? (s.grade >= 7 ? 'Aprobado' : 'No aprobado') : 'Pendiente'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Historial de Intentos del Reto (Challenge Attempts) */}
                        {selectedContent.submission.attempts && selectedContent.submission.attempts.length > 0 && (
                          <div className="border border-slate-700 rounded-xl overflow-hidden mt-6">
                            <div className="px-4 py-2.5 bg-slate-700/30 border-b border-slate-700">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historial de Calificaciones</p>
                            </div>
                            <div className="divide-y divide-slate-700/50">
                              {selectedContent.submission.attempts.map((attempt) => (
                                <div key={attempt.attemptNumber} className="p-4 hover:bg-slate-700/10 transition-colors">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-black text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded">
                                        Intento #{attempt.attemptNumber}
                                      </span>
                                      <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded-full ${attempt.grade !== null ? (attempt.grade >= 7 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400') : 'bg-slate-700 text-slate-500'}`}>
                                        {attempt.grade !== null ? (attempt.grade >= 7 ? 'Aprobado' : 'No aprobado') : 'Pendiente'}
                                      </span>
                                    </div>
                                    {attempt.grade !== null && (
                                      <span className={`font-black text-lg ${attempt.grade >= 7 ? 'text-green-400' : 'text-red-400'}`}>
                                        {attempt.grade}/10
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-1.5">
                                    <p className="text-xs text-slate-400 line-clamp-1">
                                      <span className="font-bold">URL:</span> <a href={attempt.gitUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{attempt.gitUrl}</a>
                                    </p>
                                    {attempt.comment && (
                                      <p className="text-xs text-slate-400">
                                        <span className="font-bold">Comentario:</span> {attempt.comment}
                                      </p>
                                    )}
                                    {attempt.observations && (
                                      <div className="mt-2 p-2 bg-slate-900 border border-slate-700 rounded-lg">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                          Feedback de {attempt.gradedByTutor ? `${attempt.gradedByTutor.names} ${attempt.gradedByTutor.lastNames}` : 'Tutor'}
                                        </p>
                                        <p className="text-xs text-slate-300">{attempt.observations}</p>
                                      </div>
                                    )}
                                    {attempt.tutorRating && (
                                      <div className="flex items-center gap-2 mt-2">
                                        <span className="text-yellow-400 text-xs">{'★'.repeat(attempt.tutorRating)}{'☆'.repeat(5 - attempt.tutorRating)}</span>
                                        <span className="text-[10px] text-slate-500 italic">Evaluaste al tutor</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rate tutor — handled by mandatory modal */}

                        {/* Already rated */}
                        {selectedContent.submission.tutoring?.rating && (
                          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-2 mt-4">
                            <span className="text-yellow-400 text-sm">{'★'.repeat(selectedContent.submission.tutoring.rating)}{'☆'.repeat(5 - selectedContent.submission.tutoring.rating)}</span>
                            <span className="text-[10px] text-slate-400 uppercase font-black">Ya calificaste a tu tutor</span>
                          </div>
                        )}

                        {selectedContent.submission.grade !== null && selectedContent.submission.grade < 7 && (
                          <button 
                            onClick={() => {
                              setGitUrl(selectedContent.submission!.gitUrl || '');
                              setComment('');
                              setIsResubmitting(true);
                            }}
                            className="mt-4 w-full py-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                          >
                            Volver a intentar (Reenviar Código)
                          </button>
                        )}
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
                        <div className="flex gap-3">
                          {isResubmitting && (
                            <button type="button" onClick={() => setIsResubmitting(false)} className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all shadow-xl">
                              Cancelar
                            </button>
                          )}
                          <button type="submit" disabled={submittingChallenge} className="flex-[2] py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-red-900/20 flex items-center justify-center gap-3">
                            {submittingChallenge && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            Confirmar Entrega
                          </button>
                        </div>
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

      {/* ── Badge Earned Modal ── */}
      {newBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-yellow-500/30 rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center animate-in zoom-in-95 duration-300">
            {/* Confetti-like decoration */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/4 w-1 h-8 bg-yellow-400/30 rotate-12" />
              <div className="absolute top-2 right-1/3 w-1 h-6 bg-red-400/30 -rotate-12" />
              <div className="absolute top-1 right-1/4 w-1 h-10 bg-blue-400/30 rotate-6" />
            </div>

            <div className="relative mb-6">
              <div className="w-32 h-32 mx-auto rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-2 border-yellow-500/40 flex items-center justify-center overflow-hidden shadow-xl shadow-yellow-900/20">
                {newBadge.imageUrl || newBadge.image_url ? (
                  <img src={newBadge.imageUrl || newBadge.image_url} alt={newBadge.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">🏆</span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-lg shadow-lg">
                ✓
              </div>
            </div>

            <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-2">¡Insignia Obtenida!</p>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{newBadge.name}</h2>
            {newBadge.description && (
              <p className="text-sm text-slate-400 mb-6 italic">"{newBadge.description}"</p>
            )}

            <button
              onClick={() => setNewBadge(null)}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-yellow-900/20"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* ── Tutoring Request Modal ── */}
      {showTutoringModal && selectedTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">Solicitar Tutoría</h2>
              <p className="text-xs text-slate-500">Completa los datos para solicitar tu sesión de validación.</p>
            </div>

            <div className="space-y-4">
              {/* Bloque */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Bloque</label>
                <div className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm font-bold">
                  {currentBlock?.name ?? selectedTopic.blockName ?? 'Bloque actual'}
                </div>
              </div>

              {/* Fecha de solicitud */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fecha de Solicitud</label>
                <input
                  type="datetime-local"
                  value={tutoringDate}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={e => setTutoringDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Observación */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Observación <span className="text-slate-600 normal-case font-medium">(opcional)</span>
                </label>
                <textarea
                  rows={3}
                  value={tutoringObservation}
                  onChange={(e) => setTutoringObservation(e.target.value)}
                  placeholder="Ej: Tengo dudas sobre el tema X, me gustaría reforzar..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none placeholder-slate-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowTutoringModal(false)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={requestingTutoring}
                onClick={handleRequestTutoring}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {requestingTutoring && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Solicitar Tutoría
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Badge Modal ── */}
      {newBadge && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-yellow-500/30 rounded-2xl p-8 w-full max-w-sm shadow-2xl shadow-yellow-900/20 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center overflow-hidden">
              {newBadge.imageUrl
                ? <img src={newBadge.imageUrl} alt={newBadge.name} className="w-full h-full object-cover" />
                : <span className="text-4xl">🏅</span>
              }
            </div>
            <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-1">¡Insignia obtenida!</p>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">{newBadge.name}</h2>
            {newBadge.description && (
              <p className="text-sm text-slate-400 mb-6">{newBadge.description}</p>
            )}
            <button
              onClick={() => setNewBadge(null)}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 font-black text-sm uppercase tracking-widest rounded-xl transition-all"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {/* ── Mandatory Tutor Rating Modal ── */}
      {showRatingModal && pendingRatingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">Califica a tu Tutor</h2>
              <p className="text-sm text-slate-400">Tu tutor <span className="text-white font-bold">{pendingRatingSubmission.tutorName}</span> ya calificó tu reto.</p>
              <p className="text-xs text-slate-500 mt-1">Debes calificarlo para continuar.</p>
            </div>

            <div className="flex items-center justify-center gap-3 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setTutorRating(star)}
                  className={`text-4xl transition-all hover:scale-110 ${star <= tutorRating ? 'text-yellow-400 drop-shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  ★
                </button>
              ))}
            </div>

            {tutorRating > 0 && (
              <p className="text-center text-sm text-slate-400 mb-4">
                {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][tutorRating]}
                {' '}— {tutorRating}/5
              </p>
            )}

            <button
              disabled={tutorRating === 0 || ratingSubmitting}
              onClick={() => handleRateTutor(pendingRatingSubmission!.id, tutorRating)}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {ratingSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {tutorRating === 0 ? 'Selecciona una calificación' : 'Enviar Calificación'}
            </button>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        confirmLabel={dialog.confirmLabel}
        onConfirm={dialog.onConfirm}
        onCancel={closeDialog}
      />
    </>
  );
}

// ── YouTube IFrame API Player ────────────────────────────────────────────────
// Uses the official YouTube IFrame API to track real watch progress
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function YouTubePlayer({
  videoId,
  onProgress,
  onStart,
  initialProgress,
}: {
  videoId: string;
  onProgress: (pct: number) => void;
  onStart: () => void;
  initialProgress: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastReportedRef = useRef<number>(initialProgress);
  const startedRef = useRef(false);

  const clearTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTracking = useCallback(() => {
    clearTracking();
    intervalRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player || typeof player.getCurrentTime !== 'function') return;
      const duration = player.getDuration?.() || 0;
      if (duration <= 0) return;
      const current = player.getCurrentTime();
      const pct = Math.round((current / duration) * 100);
      // Report every 5% or when >= 90%
      if (pct >= lastReportedRef.current + 5 || (pct >= 90 && lastReportedRef.current < 90)) {
        lastReportedRef.current = pct;
        onProgress(pct);
      }
    }, 3000);
  }, [onProgress]);

  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!containerRef.current || !isMounted) return;
      // Destroy previous player if any
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) { }
        playerRef.current = null;
      }
      clearTracking();
      startedRef.current = false;
      lastReportedRef.current = initialProgress;

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: { rel: 0, modestbranding: 1, enablejsapi: 1 },
        events: {
          onStateChange: (event: any) => {
            const YT = window.YT;
            if (event.data === YT.PlayerState.PLAYING) {
              if (!startedRef.current) {
                startedRef.current = true;
                onStart();
              }
              startTracking();
            } else if (
              event.data === YT.PlayerState.PAUSED ||
              event.data === YT.PlayerState.ENDED
            ) {
              clearTracking();
              // Report final position on pause/end
              const duration = playerRef.current?.getDuration?.() || 0;
              const current = playerRef.current?.getCurrentTime?.() || 0;
              if (duration > 0) {
                const pct = event.data === YT.PlayerState.ENDED
                  ? 100
                  : Math.round((current / duration) * 100);
                if (pct > lastReportedRef.current) {
                  lastReportedRef.current = pct;
                  onProgress(pct);
                }
              }
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Load the API script if not already loaded
      if (!document.getElementById('yt-iframe-api')) {
        const script = document.createElement('script');
        script.id = 'yt-iframe-api';
        script.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(script);
      }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        if (isMounted) initPlayer();
      };
    }

    return () => {
      isMounted = false;
      clearTracking();
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) { }
        playerRef.current = null;
      }
    };
  }, [videoId]);

  return <div ref={containerRef} className="w-full h-full" />;
}
