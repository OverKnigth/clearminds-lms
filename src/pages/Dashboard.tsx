import { mockCourses, mockUser, mockBadges, mockTutorings, mockNotifications } from '../utils/mockData';
import CourseCard from '../components/CourseCard';
import StatsCard from '../components/StatsCard';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const inProgressCourses = mockCourses.filter(c => c.progress > 0 && c.progress < 100);
  const completedCourses = mockCourses.filter(c => c.progress === 100);
  const earnedBadges = mockBadges.filter(b => b.status === 'earned');
  const upcomingTutorings = mockTutorings.filter(t => t.status === 'confirmed' && t.studentId === mockUser.id);
  const unreadNotifications = mockNotifications.filter(n => !n.read);

  return (
    <div className="min-h-screen bg-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatsCard
            icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            value={mockCourses.length}
            label="Cursos Asignados"
            color="blue"
          />
          <StatsCard
            icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            value="75%"
            label="Progreso General"
            color="purple"
          />
          <StatsCard
            icon="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            value={earnedBadges.length}
            label="Insignias Obtenidas"
            color="green"
          />
          <StatsCard
            icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            value={upcomingTutorings.length}
            label="Tutorías Próximas"
            color="red"
          />
        </div>

        {/* Hero Section */}
        <div className="mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 p-10 border border-slate-700/50 shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-red-700/5 to-transparent rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full mb-4">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-red-400 text-sm font-semibold tracking-wide">
                BIENVENIDO, {mockUser.name.toUpperCase()}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Continúa tu camino hacia el{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-700">
                éxito profesional
              </span>
            </h1>
            
            <p className="text-lg text-slate-300 mb-6 leading-relaxed">
              Has completado el <span className="text-red-400 font-semibold">75%</span> de tu ruta de aprendizaje. 
              Cada módulo te acerca más a tus objetivos profesionales.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/course/1')}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-500/50 hover:scale-105"
              >
                Continuar Aprendiendo
              </button>
              <button 
                onClick={() => navigate('/meetings')}
                className="px-8 py-3 bg-slate-700/50 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-200 border border-slate-600 hover:border-slate-500"
              >
                Ver Tutorías
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Tutorings & Badges Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Upcoming Tutorings */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Próximas Tutorías</h3>
              <button 
                onClick={() => navigate('/meetings')}
                className="text-red-400 hover:text-red-300 text-sm font-medium"
              >
                Ver todas
              </button>
            </div>
            {upcomingTutorings.length > 0 ? (
              <div className="space-y-3">
                {upcomingTutorings.slice(0, 2).map(tutoring => (
                  <div key={tutoring.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-white font-medium">{tutoring.blockName}</p>
                        <p className="text-sm text-slate-400">{tutoring.courseName}</p>
                      </div>
                      <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">
                        Confirmada
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {tutoring.scheduledDate && new Date(tutoring.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {tutoring.scheduledTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm">No tienes tutorías programadas</p>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Mis Insignias</h3>
              <span className="text-red-400 text-sm font-medium">{earnedBadges.length} de {mockBadges.length}</span>
            </div>
            {mockBadges.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {mockBadges.map(badge => (
                  <div 
                    key={badge.id} 
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      badge.status === 'earned'
                        ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                        : badge.status === 'available'
                        ? 'bg-slate-700/50 border-red-500/30'
                        : 'bg-slate-700/30 border-slate-600 opacity-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{badge.image}</div>
                      <p className="text-xs text-white font-medium line-clamp-2">{badge.name}</p>
                      {badge.status === 'earned' && badge.earnedDate && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(badge.earnedDate).toLocaleDateString()}
                        </p>
                      )}
                      {badge.status === 'locked' && (
                        <div className="absolute top-2 right-2">
                          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm">Aún no has obtenido insignias</p>
              </div>
            )}
          </div>
        </div>

        {/* In Progress Section */}
        {inProgressCourses.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">En Progreso</h2>
                <p className="text-sm text-slate-400">Continúa donde lo dejaste</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        )}

        {/* Completed Courses */}
        {completedCourses.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Cursos Completados</h2>
                <p className="text-sm text-slate-400">Celebra tus logros</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span className="text-green-400 text-sm font-semibold">{completedCourses.length} Completado{completedCourses.length > 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
