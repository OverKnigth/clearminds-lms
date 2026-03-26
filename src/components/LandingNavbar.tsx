import { useNavigate } from 'react-router-dom';
import krakedevLogo from '../assets/krakedev_logo.png';

export default function LandingNavbar() {
  const navigate = useNavigate();

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={handleLogoClick} className="flex items-center cursor-pointer">
          <img src={krakedevLogo} alt="KrakeDev" className="h-10 sm:h-12" />
        </button>
        <div className="flex items-center gap-3 sm:gap-6">
          <a href="#cursos" className="hidden md:block text-slate-300 hover:text-white transition-colors text-sm">Cursos</a>
          <a href="#metodologia" className="hidden md:block text-slate-300 hover:text-white transition-colors text-sm">Metodología</a>
          <a href="#historias" className="hidden lg:block text-slate-300 hover:text-white transition-colors text-sm">Historias de Éxito</a>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => window.location.href = 'mailto:contacto@krakedev.com'}
              className="hidden sm:block px-4 sm:px-6 py-2 sm:py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Contáctanos
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Ingresar
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
