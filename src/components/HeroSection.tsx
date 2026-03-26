interface HeroSectionProps {
  userName: string;
  progress: number;
  nextMilestone: string;
}

export default function HeroSection({ userName, progress, nextMilestone }: HeroSectionProps) {
  return (
    <div className="mb-8 lg:mb-12 relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-6 sm:p-8 lg:p-12 border border-slate-700/50">
      <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-red-500/5 rounded-full blur-3xl" />
      <div className="relative z-10">
        <p className="text-red-400 text-xs sm:text-sm font-semibold mb-2 tracking-wider">
          BIENVENIDO DE NUEVO, {userName.toUpperCase()}
        </p>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
          ¿Listo para transformar tu{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-700">
            futuro?
          </span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6">
          Has completado el {progress}% de tu ruta actual. El próximo hito en{' '}
          <span className="text-white font-medium">{nextMilestone}</span> te espera.
        </p>
        <button className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-500/50 text-sm sm:text-base">
          Continuar Aprendiendo
        </button>
      </div>
    </div>
  );
}
