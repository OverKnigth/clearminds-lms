import { useNavigate } from 'react-router-dom';

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
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <button onClick={handleLogoClick} className="flex items-center cursor-pointer">
          <img src="/clearminds_logo.png" alt="Clear Minds" className="h-20" />
        </button>
        <div className="flex items-center gap-8">
          <a href="#cursos" className="text-slate-300 hover:text-white transition-colors">Cursos</a>
          <a href="#metodologia" className="text-slate-300 hover:text-white transition-colors">Metodología</a>
          <a href="#historias" className="text-slate-300 hover:text-white transition-colors">Historias de Éxito</a>
          <button
            onClick={() => window.location.href = 'mailto:contacto@clearminds.com'}
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Contáctanos
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium transition-colors"
          >
            Ingresar
          </button>
        </div>
      </div>
    </nav>
  );
}
