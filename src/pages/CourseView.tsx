import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockCourses } from '../utils/mockData';
import Footer from '../components/Footer';

export default function CourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = mockCourses.find(c => c.id === courseId);
  const [selectedModule, setSelectedModule] = useState(0);

  if (!course) {
    return <div className="text-white">Curso no encontrado</div>;
  }

  const currentModule = course.modules[selectedModule];

  const handleVideoClick = (videoId: string, locked: boolean) => {
    if (!locked) {
      navigate(`/course/${courseId}/video/${videoId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-16 flex">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 overflow-y-auto">
        <div className="p-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Dashboard
          </button>

          <h2 className="text-xl font-bold text-white mb-2">{course.title}</h2>
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <span className="text-sm text-slate-400">{course.progress}%</span>
          </div>
        </div>

        <div className="px-6 pb-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Contenido del Curso</h3>
          {course.modules.map((module, idx) => (
            <div key={module.id} className="mb-4">
              <button
                onClick={() => setSelectedModule(idx)}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  selectedModule === idx
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-cyan-400">MODULE {module.order}</span>
                  <span className="text-xs text-slate-500">{module.videos.length} videos</span>
                </div>
                <p className="font-medium">{module.title}</p>
              </button>

              {selectedModule === idx && (
                <div className="mt-2 ml-4 space-y-2">
                  {module.videos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => handleVideoClick(video.id, video.locked)}
                      disabled={video.locked}
                      className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${
                        video.locked
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-slate-700/30 cursor-pointer'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        video.completed
                          ? 'bg-green-500'
                          : video.locked
                          ? 'bg-slate-600'
                          : 'bg-slate-700 border-2 border-cyan-400'
                      }`}>
                        {video.completed ? (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : video.locked ? (
                          <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-300 truncate">{video.title}</p>
                        <p className="text-xs text-slate-500">{video.duration}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {currentModule ? (
            <div>
              <div className="mb-8">
                <span className="inline-block px-3 py-1 text-xs font-semibold bg-cyan-500/20 text-cyan-400 rounded-full mb-4">
                  {course.category}
                </span>
                <h1 className="text-3xl font-bold text-white mb-4">{currentModule.title}</h1>
                <p className="text-slate-400">
                  Completa todos los videos de este módulo para desbloquear el siguiente
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentModule.videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => handleVideoClick(video.id, video.locked)}
                    disabled={video.locked}
                    className={`text-left bg-slate-800 rounded-xl overflow-hidden border border-slate-700 transition-all hover:scale-105 hover:shadow-xl ${
                      video.locked ? 'opacity-50 cursor-not-allowed' : 'hover:border-cyan-500/50'
                    }`}
                  >
                    <div className="aspect-video bg-slate-700 flex items-center justify-center relative">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        video.completed ? 'bg-green-500' : video.locked ? 'bg-slate-600' : 'bg-cyan-500'
                      }`}>
                        {video.completed ? (
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : video.locked ? (
                          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                      <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-1">{video.title}</h3>
                      <p className="text-sm text-slate-400 line-clamp-2">{video.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-slate-400">No hay módulos disponibles aún</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
      <Footer />
