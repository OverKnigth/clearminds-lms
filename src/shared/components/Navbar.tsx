import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { mockNotifications } from '../utils/mockData';
import krakedevLogo from '../assets/krakedev_logo.png';
import { api } from '../services/api';

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
  const isTutor = location.pathname.startsWith('/tutor');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const notifications = mockNotifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  const userRole = localStorage.getItem('userRole') || 'student';
  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    tutor: 'Tutor',
    student: 'Estudiante'
  };
  const roleLabel = roleLabels[userRole] || 'Estudiante';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.logout();
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      tutoring: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      grade: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      badge: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
      deadline: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      course: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      system: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    };
    return icons[type] || icons.system;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src={krakedevLogo} alt="KrakeDev" className="h-12" />
        </Link>

        {user && (
          <div className="flex items-center gap-6">
            {!isAdmin && !isTutor && (
              <>
                <Link to="/dashboard" className={`text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'text-red-400' : 'text-slate-400 hover:text-white'}`}>
                  Mis Cursos
                </Link>
                <Link to="/meetings" className={`text-sm font-medium transition-colors ${location.pathname === '/meetings' ? 'text-red-400' : 'text-slate-400 hover:text-white'}`}>
                  Reuniones
                </Link>
              </>
            )}

            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors relative">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
                  <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                    <h3 className="font-semibold text-white">Notificaciones</h3>
                    {unreadCount > 0 && <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">{unreadCount} nuevas</span>}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className={`p-4 hover:bg-slate-700/50 transition-colors border-b border-slate-700/50 ${!notif.read ? 'bg-slate-700/30' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getNotificationIcon(notif.type)} />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white mb-1">{notif.title}</p>
                            <p className="text-sm text-slate-400 mb-2">{notif.message}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-slate-500">{formatTime(notif.createdAt)}</p>
                              {!notif.read && <span className="w-2 h-2 bg-red-400 rounded-full"></span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative pl-4 border-l border-slate-700">
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <span className="text-sm text-slate-300">{user.name}</span>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-medium shadow-lg shadow-red-500/30">
                  {user.name.charAt(0)}
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
                  <div className="p-3 border-b border-slate-700">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{roleLabel}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full p-3 text-left text-sm text-red-400 hover:bg-slate-700/50 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
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
