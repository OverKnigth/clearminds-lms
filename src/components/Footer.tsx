export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-6 sm:py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <span className="text-slate-400 text-xs sm:text-sm text-center">© {new Date().getFullYear()} Elaborado por</span>
            <span className="font-bold text-red-500 text-base sm:text-lg">Krakedev</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-slate-500 text-xs w-full sm:w-auto">
            <a 
              href="mailto:contacto@krakedev.com" 
              className="hover:text-red-400 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/50"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="break-all">contacto@krakedev.com</span>
            </a>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="text-center px-3">Plataforma de Aprendizaje</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
