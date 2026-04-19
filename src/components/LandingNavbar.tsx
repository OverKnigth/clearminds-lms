import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import krakedevLogo from '../assets/krakedev_logo.png';

export default function LandingNavbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogoClick = () => {
    // Si ya estamos en la landing, hacer scroll al inicio
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Si estamos en otra página, navegar a landing
      navigate('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={handleLogoClick} className="flex items-center cursor-pointer relative z-50">
          <img src={krakedevLogo} alt="KrakeDev" className="h-12" />
        </button>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">
          <a href="#cursos" className="text-slate-300 hover:text-white transition-colors">Cursos</a>
          <a href="#metodologia" className="text-slate-300 hover:text-white transition-colors">Metodología</a>
          <a href="#historias" className="text-slate-300 hover:text-white transition-colors">Historias de Éxito</a>
          <div className="flex items-center gap-3 ml-2">
            <button
              onClick={() => window.location.href = 'mailto:contacto@krakedev.com'}
              className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Contáctanos
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
            >
              Ingresar
            </button>
          </div>
        </div>

        {/* Hamburger Icon */}
        <button 
          className="lg:hidden text-slate-300 hover:text-white focus:outline-none relative z-50"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-2xl">
          <div className="flex flex-col p-6 gap-4">
            <a href="#cursos" onClick={() => setIsMenuOpen(false)} className="text-slate-300 hover:text-white transition-colors py-2 font-medium">Cursos</a>
            <a href="#metodologia" onClick={() => setIsMenuOpen(false)} className="text-slate-300 hover:text-white transition-colors py-2 font-medium">Metodología</a>
            <a href="#historias" onClick={() => setIsMenuOpen(false)} className="text-slate-300 hover:text-white transition-colors py-2 font-medium">Historias de Éxito</a>
            
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  window.location.href = 'mailto:contacto@krakedev.com';
                  setIsMenuOpen(false);
                }}
                className="w-full px-6 py-3 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors text-center"
              >
                Contáctanos
              </button>
              <button
                onClick={() => {
                  navigate('/login');
                  setIsMenuOpen(false);
                }}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors text-center"
              >
                Ingresar
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
