import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import krakedevLogo from '../assets/krakedev_logo.png';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Credenciales de administrador
    if (email === 'admin@krakedev.com' && password === 'admin123') {
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userName', 'Admin');
      navigate('/admin');
      return;
    }

    // Credenciales de tutor
    if (email === 'tutor@krakedev.com' && password === 'tutor123') {
      localStorage.setItem('userRole', 'tutor');
      localStorage.setItem('userName', 'Carlos Mendoza');
      navigate('/tutor');
      return;
    }

    // Credenciales de estudiante (cualquier otro email válido)
    if (email && password) {
      localStorage.setItem('userRole', 'student');
      localStorage.setItem('userName', email.split('@')[0]);
      navigate('/dashboard');
      return;
    }

    setError('Credenciales inválidas');
  };

  const handleGoogleLogin = () => {
    // Simular login con Google como estudiante
    localStorage.setItem('userRole', 'student');
    localStorage.setItem('userName', 'Alex Rivera');
    navigate('/dashboard');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors z-20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-10">
            <img 
              src={krakedevLogo} 
              alt="KrakeDev" 
              className="h-32 mx-auto mb-8"
            />
            <p className="text-slate-400 text-sm uppercase tracking-wider">Plataforma de Aprendizaje</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">Bienvenido de nuevo</h2>
              <p className="text-slate-400 text-sm">Inicia sesión para acceder a tu plataforma</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-red-500/50"
              >
                Iniciar Sesión
              </button>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800/50 text-slate-400">O continúa con</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-slate-50 text-slate-900 font-medium py-3.5 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-lg hover:shadow-white/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </button>

            {/* Admin credentials hint */}
            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <p className="text-xs text-slate-400 text-center mb-2">
                <span className="font-semibold text-slate-300">Acceso de Prueba:</span>
              </p>
              <div className="space-y-1 text-xs text-slate-500">
                <p>Admin: admin@krakedev.com / admin123</p>
                <p>Tutor: tutor@krakedev.com / tutor123</p>
                <p>Estudiante: cualquier email válido</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
