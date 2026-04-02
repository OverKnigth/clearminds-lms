import { useNavigate } from 'react-router-dom';
import LandingNavbar from '@/shared/components/LandingNavbar';
import Footer from '@/shared/components/Footer';
import krakedevLogo from '@/shared/assets/krakedev_logo.png';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <LandingNavbar />

      {/* Hero Section */}
      <div id="inicio" className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full mb-6">
              <span className="text-red-400 text-sm font-semibold">● ESCUELA DE PROGRAMACIÓN</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              ¿Listo para transformar tu{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">
                futuro?
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Estudia con nosotros y domina el desarrollo de software desde cero. Obtén certificaciones internacionales como AWS y trabaja con nosotros en proyectos reales.
            </p>
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-500/50"
              >
                Comenzar Ahora
              </button>
              <button
                onClick={() => document.getElementById('cursos')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors border border-slate-700"
              >
                Ver Cursos
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-700">
              <div>
                <div className="text-3xl font-bold text-red-500 mb-1">150+</div>
                <div className="text-sm text-slate-400">Estudiantes Activos</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-500 mb-1">95%</div>
                <div className="text-sm text-slate-400">Tasa de Éxito</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-500 mb-1">100+</div>
                <div className="text-sm text-slate-400">Graduados con Nosotros</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-500/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-red-600/20 rounded-full blur-2xl"></div>
              <img src={krakedevLogo} alt="KrakeDev" className="w-full h-auto relative z-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">¿Por qué elegir Krakedev?</h2>
            <p className="text-xl text-slate-400">La mejor inversión en tu futuro profesional</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { title: 'Certificaciones Internacionales', desc: 'Prepárate para certificaciones AWS, Azure y Google Cloud con nuestros programas especializados.', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
              { title: 'Oportunidades Laborales', desc: 'Trabaja con nosotros o con nuestras empresas aliadas. Conectamos talento con oportunidades reales.', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
              { title: 'Proyectos Reales', desc: 'Aprende desarrollando proyectos del mundo real. Construye tu portafolio desde el primer día.', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50 hover:border-red-500/50 transition-all">
                <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div id="cursos" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Nuestros Programas</h2>
            <p className="text-xl text-slate-400">Aprende las tecnologías más demandadas del mercado</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Desarrollo Web Full Stack', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', description: 'React, Node.js, TypeScript', duration: '6 meses' },
              { title: 'AWS Cloud Practitioner', icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z', description: 'Certificación oficial AWS', duration: '3 meses' },
              { title: 'Python & Data Science', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', description: 'Machine Learning, Pandas', duration: '5 meses' },
              { title: 'Bases de Datos', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4', description: 'SQL, PostgreSQL, MongoDB', duration: '4 meses' },
            ].map((course, idx) => (
              <div key={idx} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-red-500/50 transition-all hover:scale-105 group">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={course.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                <p className="text-sm text-slate-400 mb-3">{course.description}</p>
                <div className="flex items-center text-xs text-slate-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {course.duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Methodology */}
      <div id="metodologia" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Nuestra Metodología</h2>
            <p className="text-xl text-slate-400">Aprendizaje práctico y efectivo</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Aprende', description: 'Videos y contenido estructurado' },
              { step: '02', title: 'Practica', description: 'Ejercicios y proyectos guiados' },
              { step: '03', title: 'Construye', description: 'Desarrolla tu portafolio' },
              { step: '04', title: 'Trabaja', description: 'Oportunidades laborales reales' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg shadow-red-500/50">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div id="historias" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Historias de Éxito</h2>
            <p className="text-xl text-slate-400">Nuestros estudiantes transformando sus vidas</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'María González', role: 'Full Stack Developer', company: 'Tech Corp', testimonial: 'Pasé de no saber programar a conseguir mi primer trabajo en 6 meses.' },
              { name: 'Carlos Ramírez', role: 'Cloud Engineer', company: 'AWS Partner', testimonial: 'Obtuve mi certificación AWS y ahora trabajo en una de las mejores empresas de cloud computing.' },
              { name: 'Ana Martínez', role: 'Data Scientist', company: 'Analytics Inc', testimonial: 'El programa de Data Science me abrió las puertas a un mundo de oportunidades.' },
            ].map((story, idx) => (
              <div key={idx} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-red-500/30">
                    {story.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-white">{story.name}</div>
                    <div className="text-sm text-slate-400">{story.role} en {story.company}</div>
                  </div>
                </div>
                <p className="text-slate-300 italic">"{story.testimonial}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 px-6 bg-gradient-to-r from-red-500/10 to-red-600/10 border-y border-slate-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Comienza tu carrera en tecnología hoy</h2>
          <p className="text-xl text-slate-300 mb-8">Únete a cientos de estudiantes que ya están transformando su futuro profesional</p>
          <button
            onClick={() => window.location.href = 'mailto:contacto@krakedev.com'}
            className="px-12 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-lg font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-500/50"
          >
            Comunícate con un Asesor
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
