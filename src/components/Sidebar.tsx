import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import krakedevLogo from '../assets/krakedev_logo.png';
import { api } from '../services/api';

interface SidebarProps {
  user?: {
    name: string;
    avatar?: string;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userRole = localStorage.getItem('userRole') || 'student';
  const isAdmin = userRole === 'admin';
  const isTutor = userRole === 'tutor';

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1m-2 0h2',
      show: !isAdmin && !isTutor
    },
    {
      title: 'Mis Cursos',
      path: '/courses',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.247 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      show: !isAdmin && !isTutor
    },
    {
      title: 'Reuniones',
      path: '/meetings',
      icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
      show: !isAdmin && !isTutor
    },
    {
      title: 'Mi Perfil',
      path: '/profile',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      show: !isAdmin && !isTutor
    },
    {
      title: 'Panel Admin',
      path: '/admin',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      show: isAdmin
    },
    // Admin modules
    {
      title: 'Estudiantes',
      path: '/admin?tab=students',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      show: isAdmin
    },
    {
      title: 'Tutores',
      path: '/admin?tab=tutors',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      show: isAdmin
    },
    {
      title: 'Admins',
      path: '/admin?tab=admins',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      show: isAdmin
    },
    {
      title: 'Gestión de Cursos',
      path: '/admin?tab=courses',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.247 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      show: isAdmin
    },
    {
      title: 'Cursos',
      path: '/admin?tab=catalog',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      show: isAdmin
    },
    {
      title: 'Progreso',
      path: '/admin?tab=progress',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      show: isAdmin
    },
    {
      title: 'Insignias',
      path: '/admin?tab=badges',
      icon: 'M5 13l4 4L19 7',
      show: isAdmin
    },
    {
      title: 'Panel Tutor',
      path: '/tutor',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      show: isTutor
    },
    {
      title: 'Pendientes',
      path: '/tutor?tab=pending',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      show: isTutor
    },
    {
      title: 'Próximas',
      path: '/tutor?tab=upcoming',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      show: isTutor
    },
    {
      title: 'Completadas',
      path: '/tutor?tab=completed',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      show: isTutor
    },
    {
      title: 'Estudiantes',
      path: '/tutor?tab=students',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      show: isTutor
    },
    {
      title: 'Retos',
      path: '/tutor?tab=challenges',
      icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      show: isTutor
    }
  ];

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

  if (!user) return null;

  return (
    <aside className="w-20 hover:w-64 bg-slate-800 border-r border-slate-700 flex flex-col h-screen sticky top-0 flex-shrink-0 z-50 transition-all duration-300 ease-in-out group/sidebar overflow-hidden">
      {/* Logo Area */}
      <div className="p-6 mb-4 flex justify-center">
        <Link to="/" className="flex items-center">
          <img src={krakedevLogo} alt="KrakeDev" className="h-10 min-w-[40px] hover:scale-110 transition-transform" />
        </Link>
      </div>

      {/* Navigation Links - Scrollable */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-none pb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">Menú Principal</div>
        {menuItems.filter(item => item.show).map((item) => {
          const itemPath = item.path.split('?')[0];
          const itemQuery = item.path.includes('?') ? item.path.split('?')[1] : null;
          const isActive = itemQuery
            ? location.pathname === itemPath && location.search.includes(itemQuery)
            : location.pathname === itemPath && !location.search;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <svg className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="text-sm font-bold opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section at Bottom */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50 overflow-hidden">
        <div className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-2xl mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-black shadow-lg shadow-red-900/20 flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter capitalize">{userRole}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm disabled:opacity-50 whitespace-nowrap overflow-hidden"
        >
          {isLoggingOut ? (
            <div className="w-6 h-6 border-2 border-slate-400 border-t-red-400 rounded-full animate-spin flex-shrink-0" />
          ) : (
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          )}
          <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
            {isLoggingOut ? 'Saliendo...' : 'Cerrar Sesión'}
          </span>
        </button>
      </div>
    </aside>
  );
}
