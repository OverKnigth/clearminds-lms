import { useNavigate } from 'react-router-dom';
import type { Course } from '../types/index';

export function StudentHero({ userName, overallPct, firstCourse }: { userName: string; overallPct: number; firstCourse?: Course }) {
  const navigate = useNavigate();

  return (
    <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 border border-slate-700/50">
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl" />
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full mb-4">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          <span className="text-red-400 text-sm font-semibold">BIENVENIDO, {userName.toUpperCase() || 'ESTUDIANTE'}</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">
          Continúa tu camino hacia el{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">éxito profesional</span>
        </h1>
        <p className="text-slate-300 mb-5">
          Has completado el <span className="text-red-400 font-semibold">{overallPct}%</span> de tu ruta de aprendizaje.
        </p>
        <div className="flex gap-3">
          {firstCourse && (
            <button onClick={() => navigate(`/course/${firstCourse.slug || firstCourse.id}`)}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl transition-all">
              Continuar Aprendiendo
            </button>
          )}
          <button onClick={() => navigate('/meetings')}
            className="px-6 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all border border-slate-600">
            Ver Tutorías
          </button>
        </div>
      </div>
    </div>
  );
}
