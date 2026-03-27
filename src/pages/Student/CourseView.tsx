import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import Footer from '../../components/Footer';

interface Content {
  id: string;
  type: 'video' | 'document' | 'challenge';
  title: string;
  description: string | null;
  url: string | null;
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
  progress: { total: number; completed: number; pct: number };
}

interface TutoringSession {
  id: string;
  block_id: string;
  status: 'requested' | 'confirmed' | 'rescheduled' | 'cancelled' | 'executed';
  grade: number | null;
  scheduled_at: string | null;
}

const TYPE_ICON: Record<string, string> = {
  video: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  challenge: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
};

export default function CourseView() {
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tutoringSessions, setTutoringSessions] = useState<TutoringSession[]>([]);

  useEffect(() => {
    if (courseSlug) {
      loadCourse(courseSlug);
      loadTutoring();
    }
  }, [courseSlug]);

  const loadTutoring = async () => {
    try {
      const res = await api.getMyTutoring();
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
  const blockSessions = selectedTopic?.blockId 
    ? tutoringSessions.filter(s => s.block_id === selectedTopic.blockId) 
    : [];
  const activeSession = blockSessions.find(s => ['requested', 'confirmed', 'rescheduled'].includes(s.status));

  const handleRequestTutoring = async () => {
    if (!selectedTopic?.blockId) return;
    try {
      const res = await api.requestTutoring({ blockId: selectedTopic.blockId });
      if (res.success) {
        loadTutoring();
        alert('Tutoría solicitada con éxito. Revisa tu panel de tutorías.');
      }
    } catch (e: any) {
      alert(e.response?.data?.message || e.message);
    }
  };

  const getContentStatus = (c: Content) => {
    if (c.progress.status === 'completed') return 'completed';
    if (c.submission) return 'submitted';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-16 flex">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 overflow-y-auto flex-shrink-0 hidden md:flex flex-col">
        <div className="p-5 flex-1">
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Dashboard
          </button>
          
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2 leading-tight">{course.name}</h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-600 to-red-700 rounded-full transition-all duration-500"
                  style={{ width: `${course.progress.pct}%` }} />
              </div>
              <span className="text-xs font-bold text-slate-400">{Math.round(course.progress.pct)}%</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-4">Contenido del Curso</p>
          <div className="space-y-1">
            {course.topics.map(topic => {
              const completed = topic.contents.filter(c => c.progress.status === 'completed').length;
              const isActive = selectedTopicId === topic.id;
              return (
                <button key={topic.id} onClick={() => setSelectedTopicId(topic.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${isActive ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-white/80' : 'text-red-500 group-hover:text-red-400'}`}>
                      Tema {topic.order}
                    </span>
                    <span className={`text-[10px] font-bold ${isActive ? 'text-white/60' : 'text-slate-600'}`}>
                      {completed}/{topic.contents.length}
                    </span>
                  </div>
                  <p className="text-sm font-bold truncate leading-tight">{topic.title}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 md:p-10">
          {selectedTopic ? (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-xl shadow-red-900/20">
                    {selectedTopic.order}
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold text-white leading-none mb-2">{selectedTopic.title}</h1>
                    <div className="flex items-center gap-3">
                      {selectedTopic.blockName && (
                        <span className="text-xs font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded">
                          {selectedTopic.blockName}
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {selectedTopic.contents.length} Contenidos
                      </span>
                    </div>
                  </div>
                </div>

                {selectedTopic.blockId && (
                  <div className="flex flex-col items-end gap-2">
                    {activeSession ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-500 rounded-xl border border-orange-500/20">
                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider">Tutoría {
                          activeSession.status === 'requested' ? 'Solicitada' : 
                          activeSession.status === 'confirmed' ? 'Confirmada' : 'Reagendada'
                        }</span>
                      </div>
                    ) : (
                      <button
                        onClick={handleRequestTutoring}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-900/20 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Solicitar Tutoría
                      </button>
                    )}
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Validación de Bloque</p>
                  </div>
                )}
              </div>

              {selectedTopic.description && (
                <p className="text-lg text-slate-400 mb-10 leading-relaxed border-l-4 border-slate-800 pl-6 italic">
                  {selectedTopic.description}
                </p>
              )}

              <div className="space-y-4">
                {selectedTopic.contents.sort((a, b) => a.order - b.order).map(content => {
                  const status = getContentStatus(content);
                  const isCompleted = status === 'completed';
                  const isSubmitted = status === 'submitted';

                  return (
                    <button
                      key={content.id}
                      onClick={() => navigate(`/course/${course.slug}/content/${content.slug || content.id}`)}
                      className="w-full group flex items-center gap-5 p-5 bg-slate-800/40 hover:bg-slate-800 rounded-2xl border border-slate-700/50 hover:border-red-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-black/20"
                    >
                      {/* Icon Container */}
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105 ${
                        isCompleted ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                        isSubmitted ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                        'bg-slate-700/50 text-slate-400 group-hover:bg-red-500/10 group-hover:text-red-500 group-hover:border-red-500/20 border border-slate-600/30'
                      }`}>
                        {isCompleted ? (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={TYPE_ICON[content.type]} />
                          </svg>
                        )}
                      </div>

                      {/* Content Info */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                            {content.type === 'video' ? 'Video' : content.type === 'document' ? 'Documento' : 'Reto'}
                          </span>
                          {content.type === 'video' && content.durationMinutes && (
                            <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-slate-700/50 rounded-full border border-slate-600/30">
                              {content.durationMinutes} min
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors truncate">
                          {content.title}
                        </h3>
                        {content.description && (
                          <p className="text-sm text-slate-500 truncate group-hover:text-slate-400 transition-colors mt-0.5">
                            {content.description}
                          </p>
                        )}
                      </div>

                      {/* Meta Info */}
                        <div className="flex items-center gap-4">
                          {content.type !== 'video' && content.allowDownload && content.url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(content.url!, '_blank');
                              }}
                              className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors group/download"
                              title="Descargar documento"
                            >
                              <svg className="w-5 h-5 transition-transform group-hover/download:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                          )}

                          {content.type === 'challenge' && content.deadline && (
                          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-orange-500/80 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(content.deadline).toLocaleDateString('es', { day: '2-digit', month: '2-digit' })}
                          </div>
                        )}
                        
                        <div className="text-slate-600 group-hover:text-red-500 transition-all duration-300 transform group-hover:translate-x-1">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-32">
              <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Comienza a aprender</h2>
              <p className="text-slate-400">Selecciona un tema del menú lateral para ver su contenido</p>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
}
