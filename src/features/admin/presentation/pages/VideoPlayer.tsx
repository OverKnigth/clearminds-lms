import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockCourses } from '@/shared/utils/mockData';
import Footer from '@/shared/components/Footer';
import ChallengeSubmission from '@/shared/components/ChallengeSubmission';
import type { ChallengeSubmission as ChallengeSubmissionType } from '@/shared/models/types';

export default function VideoPlayer() {
  const { courseId, videoId } = useParams();
  const navigate = useNavigate();
  const course = mockCourses.find(c => c.id === courseId);
  
  const [currentVideo, setCurrentVideo] = useState(() => {
    if (!course) return null;
    for (const module of course.modules) {
      const video = module.videos.find(v => v.id === videoId);
      if (video) return { video, module };
    }
    return null;
  });

  useEffect(() => {
    if (!course) return;
    for (const module of course.modules) {
      const video = module.videos.find(v => v.id === videoId);
      if (video) {
        setCurrentVideo({ video, module });
        return;
      }
    }
  }, [videoId, course]);

  if (!course || !currentVideo) {
    return <div className="text-white">Contenido no encontrado</div>;
  }

  const { video, module } = currentVideo;
  const isChallenge = video.type === 'challenge';

  const handleVideoSelect = (newVideoId: string) => {
    navigate(`/course/${courseId}/video/${newVideoId}`);
  };

  const handleChallengeSubmit = (submission: Partial<ChallengeSubmissionType>) => {
    console.log('Challenge submitted:', submission);
    alert('¡Reto enviado exitosamente! Tu tutor revisará tu trabajo pronto.');
  };

  const getVideoIcon = (v: typeof video) => {
    if (v.type === 'challenge') {
      if (v.challengeData?.submission?.status === 'approved') {
        return (
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      }
      if (v.challengeData?.submission?.status === 'needs_correction') {
        return (
          <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      }
      if (v.challengeData?.submission) {
        return (
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      }
      return (
        <div className="w-8 h-8 rounded-lg bg-slate-700 border-2 border-red-400 flex items-center justify-center">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      );
    }
    
    if (v.completed) {
      return (
        <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    
    return (
      <div className="w-8 h-8 rounded-lg bg-slate-700 border-2 border-red-400 flex items-center justify-center">
        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-16 flex">
      {/* Sidebar - Left */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 overflow-y-auto flex-shrink-0">
        <div className="p-6">
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Curso
          </button>

          <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
            {module.title}
          </h3>
          
          <div className="space-y-2">
            {module.videos.map((v) => (
              <button
                key={v.id}
                onClick={() => handleVideoSelect(v.id)}
                className={`w-full p-4 rounded-lg flex items-center gap-3 transition-all text-left ${
                  v.id === video.id
                    ? 'bg-red-500/20 border-2 border-red-500'
                    : 'bg-slate-700/30 hover:bg-slate-700/50 border-2 border-transparent'
                }`}
              >
                {getVideoIcon(v)}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    v.id === video.id ? 'text-white' : 'text-slate-300'
                  }`}>
                    {v.title}
                  </p>
                  {v.type === 'video' && (
                    <p className="text-xs text-slate-500">{v.duration}</p>
                  )}
                  {v.type === 'challenge' && (
                    <p className="text-xs text-red-400">Reto Práctico</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {isChallenge ? (
            // Challenge View
            <div>
              <div className="mb-6">
                <div className="inline-block px-3 py-1 text-xs font-semibold bg-red-500/20 text-red-400 rounded-full mb-3">
                  RETO PRÁCTICO
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{video.title}</h1>
                <p className="text-slate-400">{video.description}</p>
              </div>

              {video.challengeData && (
                <ChallengeSubmission
                  challenge={video.challengeData}
                  onSubmit={handleChallengeSubmit}
                />
              )}
            </div>
          ) : (
            // Video View
            <div>
              <div className="mb-6">
                <div className="inline-block px-3 py-1 text-xs font-semibold bg-red-500/20 text-red-400 rounded-full mb-3">
                  VIDEO
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">{video.title}</h1>
                <p className="text-slate-400">{video.description}</p>
              </div>

              {/* Video Player */}
              <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6 shadow-2xl">
                <iframe
                  src={video.url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => {
                    // Auto-mark as completed after video loads (simulating watch)
                    // In production, track actual video completion
                    if (!video.completed) {
                      setTimeout(() => {
                        console.log('Video watched, marking as completed');
                        // Here you would update the video status in your backend
                      }, 3000);
                    }
                  }}
                />
              </div>

              {/* Video Actions */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex gap-4">
                  {video.pdfUrl && (
                    <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Descargar Material
                    </button>
                  )}
                  
                  {!video.completed && (
                    <button 
                      onClick={() => {
                        alert('¡Video marcado como completado!');
                        // Here you would update the video status in your backend
                        window.location.reload();
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-red-500/50 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Marcar como Completado
                    </button>
                  )}
                  
                  {video.completed && (
                    <div className="flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-400 font-semibold">Completado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
