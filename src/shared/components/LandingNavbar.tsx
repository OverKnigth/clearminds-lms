import { useNavigate } from 'react-router-dom';
import krakedevLogo from '../assets/krakedev_logo.png';

export default function LandingNavbar() {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={handleLogoClick} className="flex items-center cursor-pointer">
          <img src={krakedevLogo} alt="KrakeDev" className="h-12" />
        </button>
        <div className="flex items-center gap-6">
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
      </div>
    </nav>
  );
}
