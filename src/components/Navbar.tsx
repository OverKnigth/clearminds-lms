import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface NavbarProps {
  user?: {
    name: string;
    avatar?: string;
  };
}

export default function Navbar({ user }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Mock notifications
  const notifications = [
    { id: 1, type: 'grade', message: 'Nueva calificación: 95/100 en Desarrollo Web', time: '5 min' },
    { id: 2, type: 'course', message: 'Nuevo módulo disponible en AWS Cloud', time: '1 hora' },
    { id: 3, type: 'achievement', message: '¡Felicidades! Completaste Python para Data Science', time: '2 horas' },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/clearminds_logo.png" alt="Clear Minds" className="h-20" />
        </Link>

        {user && (
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors ${
                !isAdmin && location.pathname === '/dashboard' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mis Cursos
            </Link>
            <Link
              to="/meetings"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/meetings' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Reuniones
            </Link>
            {user.name === 'Admin' && (
              <Link
                to="/admin"
                className={`text-sm font-medium transition-colors ${
                  isAdmin ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                Admin
              </Link>
            )}
            
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors relative"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="font-semibold text-white">Notificaciones</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-4 hover:bg-slate-700/50 transition-colors border-b border-slate-700/50">
                        <p className="text-sm text-white mb-1">{notif.message}</p>
                        <p className="text-xs text-slate-500">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t border-slate-700">
                    <button className="text-sm text-cyan-400 hover:text-cyan-300">Ver todas</button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative pl-4 border-l border-slate-700">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <span className="text-sm text-slate-300">{user.name}</span>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-medium">
                  {user.name.charAt(0)}
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
                  <div className="p-3 border-b border-slate-700">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">Estudiante</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full p-3 text-left text-sm text-red-400 hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
