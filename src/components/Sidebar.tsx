import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import krakedevLogo from '../assets/krakedev_logo.png';
import { api } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';

interface SidebarProps {
  user?: { name: string; avatar?: string };
}

const TYPE_ICON: Record<string, string> = {
  tutoring_requested: 'TR',
  tutoring_confirmed: 'TC',
  tutoring_rescheduled: 'RS',
  tutoring_cancelled: 'CX',
  tutoring_graded: 'TG',
  grade: 'NT',
  badge_earned: 'IN',
  deadline: 'DL',
  block_approved: 'OK',
};

// Colores por tipo — mismos que el dashboard
const TYPE_COLOR: Record<string, { dot: string; bg: string; text: string }> = {
  tutoring_requested: { dot: 'bg-yellow-400', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  tutoring_confirmed: { dot: 'bg-blue-400', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  tutoring_rescheduled: { dot: 'bg-orange-400', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  tutoring_cancelled: { dot: 'bg-red-400', bg: 'bg-red-500/10', text: 'text-red-400' },
  tutoring_graded: { dot: 'bg-orange-400', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  grade: { dot: 'bg-orange-400', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  badge_earned: { dot: 'bg-purple-400', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  deadline: { dot: 'bg-red-400', bg: 'bg-red-500/10', text: 'text-red-400' },
  block_approved: { dot: 'bg-green-400', bg: 'bg-green-500/10', text: 'text-green-400' },
};

function timeAgo(d: string | null): string {
  if (!d) return '';
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function Sidebar({ user }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(80);
  const [openTutorGroups, setOpenTutorGroups] = useState<{ tutorias: boolean; retos: boolean }>({
    tutorias: true,
    retos: true,
  });

  const userRole = localStorage.getItem('userRole') || 'student';
  const isAdmin = userRole === 'admin';

  const { notifications, unreadCount, isOpen: notifOpen, setIsOpen: setNotifOpen, markRead, markAllRead } = useNotifications();

  // Sidebar expands on hover BUT collapses when notif panel is open
  const expanded = notifOpen ? false : hovered;

  // Track actual sidebar width for panel left offset
  useEffect(() => {
    if (!sidebarRef.current) return;
    const obs = new ResizeObserver(entries => {
      setSidebarWidth(entries[0].contentRect.width);
    });
    obs.observe(sidebarRef.current);
    return () => obs.disconnect();
  }, []);

  // Close notif panel on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (sidebarRef.current?.contains(t)) return;
      // check notif panel portal
      const panel = document.getElementById('notif-panel');
      if (panel?.contains(t)) return;
      setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen, setNotifOpen]);

  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1m-2 0h2', show: !isAdmin && userRole !== 'tutor' },
    { title: 'Mis Cursos', path: '/courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.247 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', show: !isAdmin && userRole !== 'tutor' },
    { title: 'Reuniones', path: '/meetings', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', show: !isAdmin && userRole !== 'tutor' },
    { title: 'Dashboard', path: '/admin', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', show: isAdmin },
    { title: 'Estudiantes', path: '/admin?tab=students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', show: isAdmin },
    { title: 'Tutores', path: '/admin?tab=tutors', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', show: isAdmin },
    { title: 'Admins', path: '/admin?tab=admins', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', show: isAdmin },
    { title: 'Cursos', path: '/admin?tab=catalog', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', show: isAdmin },
    { title: 'Gestión de Grupos', path: '/admin?tab=courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.247 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', show: isAdmin },
    { title: 'Insignias', path: '/admin?tab=badges', icon: 'M5 13l4 4L19 7', show: isAdmin },
    { title: 'Progreso', path: '/admin?tab=progress', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', show: isAdmin },
  ];

  const tutorDashboardItem = {
    title: 'Dashboard',
    path: '/tutor?tab=dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  };

  const tutorGroups = [
    {
      id: 'tutorias' as const,
      title: 'Tutorías',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      children: [
        { title: 'Pendientes', path: '/tutor?tab=pending', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { title: 'Confirmadas', path: '/tutor?tab=confirmed', icon: 'M5 13l4 4L19 7' },
        { title: 'Completadas', path: '/tutor?tab=completed', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
      ],
    },
    {
      id: 'retos' as const,
      title: 'Retos',
      icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      children: [
        { title: 'Pendientes', path: '/tutor?tab=challenge-pending', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { title: 'Calificados', path: '/tutor?tab=challenge-graded', icon: 'M5 13l4 4L19 7' },
      ],
    },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try { await api.logout(); navigate('/'); }
    catch { navigate('/'); }
    finally { setIsLoggingOut(false); }
  };

  if (!user) return null;

  // Notification panel rendered via portal, positioned right of sidebar
  const notifPanel = notifOpen ? createPortal(
    <div
      id="notif-panel"
      style={{ position: 'fixed', top: 0, left: sidebarWidth, width: 280, height: '100vh', zIndex: 49 }}
      className="bg-slate-900 border-r border-slate-700/60 flex flex-col shadow-2xl shadow-black/40"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-xs font-black text-white uppercase tracking-widest">Notificaciones</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 bg-red-600/20 border border-red-600/30 text-red-400 text-[9px] font-black rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-[9px] font-black text-slate-600 hover:text-slate-300 uppercase tracking-widest transition-colors">
              Leer todas
            </button>
          )}
          <button onClick={() => setNotifOpen(false)} className="text-slate-600 hover:text-slate-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 pb-16">
            <svg className="w-10 h-10 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-[10px] text-slate-700 uppercase tracking-widest font-black">Sin notificaciones</p>
          </div>
        ) : (
          notifications.map(n => (
            <button
              key={n.id}
              onClick={() => !n.read && markRead(n.id)}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40 transition-colors ${!n.read ? 'bg-slate-800/20' : ''}`}
            >
              {/* Colored icon pill */}
              <span className={`flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center text-sm ${(TYPE_COLOR[n.type ?? ''] ?? TYPE_COLOR['block_approved']).bg}`}>
                {TYPE_ICON[n.type ?? ''] ?? 'NT'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <p className={`text-[11px] font-black uppercase tracking-tight truncate ${n.read ? 'text-slate-500' : 'text-white'}`}>
                    {n.title}
                  </p>
                  <span className="text-[9px] text-slate-700 flex-shrink-0">{timeAgo(n.created_at)}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{n.body}</p>
              </div>
              {!n.read && (
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${(TYPE_COLOR[n.type ?? ''] ?? { dot: 'bg-red-500' }).dot}`} />
              )}
            </button>
          ))
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <aside
        ref={sidebarRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`${expanded ? 'w-64' : 'w-20'} bg-slate-800 border-r border-slate-700 flex flex-col h-screen sticky top-0 flex-shrink-0 z-50 transition-all duration-300 ease-in-out overflow-hidden`}
      >
        {/* Logo */}
        <div className="p-6 mb-4 flex justify-center">
          <Link to="/" className="flex items-center">
            <img src={krakedevLogo} alt="KrakeDev" className="h-10 min-w-[40px] hover:scale-110 transition-transform" />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-none pb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className={`text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2 transition-opacity duration-300 whitespace-nowrap ${expanded ? 'opacity-100' : 'opacity-0'}`}>
            Menú Principal
          </div>
          {userRole === 'tutor'
            ? (
              <>
                {(() => {
                  const dashboardPath = tutorDashboardItem.path.split('?')[0];
                  const dashboardQuery = tutorDashboardItem.path.split('?')[1];
                  const dashboardActive = location.pathname === dashboardPath && location.search.includes(dashboardQuery);
                  return (
                    <Link
                      to={tutorDashboardItem.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group border ${dashboardActive ? 'bg-slate-700/70 text-white border-slate-600' : 'text-slate-400 border-transparent hover:bg-slate-700/40 hover:text-slate-200'}`}
                    >
                      <svg className={`w-5 h-5 flex-shrink-0 ${dashboardActive ? 'text-slate-100' : 'text-slate-500 group-hover:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tutorDashboardItem.icon} />
                      </svg>
                      <span className={`text-sm font-semibold transition-opacity duration-300 whitespace-nowrap ${expanded ? 'opacity-100' : 'opacity-0'}`}>{tutorDashboardItem.title}</span>
                    </Link>
                  );
                })()}

                {tutorGroups.map((group) => {
                  const hasActiveChild = group.children.some((child) => {
                    const childPath = child.path.split('?')[0];
                    const childQuery = child.path.split('?')[1];
                    return location.pathname === childPath && location.search.includes(childQuery);
                  });

                  return (
                    <div key={group.id} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setOpenTutorGroups((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group border ${hasActiveChild ? 'bg-slate-700/60 text-slate-100 border-slate-600' : 'text-slate-300 border-transparent hover:bg-slate-700/40 hover:text-slate-100'}`}
                      >
                        <svg className={`w-5 h-5 flex-shrink-0 ${hasActiveChild ? 'text-slate-100' : 'text-slate-500 group-hover:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={group.icon} />
                        </svg>
                        <span className={`text-sm font-semibold transition-opacity duration-300 whitespace-nowrap ${expanded ? 'opacity-100' : 'opacity-0'}`}>
                          {group.title}
                        </span>
                        <svg
                          className={`w-4 h-4 ml-auto transition-all duration-200 ${openTutorGroups[group.id] ? 'rotate-180' : ''} ${expanded ? 'opacity-100' : 'opacity-0'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {expanded && openTutorGroups[group.id] && (
                        <div className={`${expanded ? 'ml-6' : ''} space-y-1`}>
                          {group.children.map((child) => {
                            const childPath = child.path.split('?')[0];
                            const childQuery = child.path.split('?')[1];
                            const childActive = location.pathname === childPath && location.search.includes(childQuery);
                            return (
                              <Link
                                key={child.path}
                                to={child.path}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group border ${childActive ? 'bg-slate-700/60 text-slate-100 border-slate-600' : 'text-slate-400 border-transparent hover:bg-slate-700/30 hover:text-slate-200'}`}
                              >
                                <svg className={`w-4 h-4 flex-shrink-0 ${childActive ? 'text-slate-200' : 'text-slate-600 group-hover:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={child.icon} />
                                </svg>
                                <span className={`text-xs font-medium transition-opacity duration-300 whitespace-nowrap ${expanded ? 'opacity-100' : 'opacity-0'}`}>
                                  {child.title}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )
            : menuItems.filter(i => i.show).map(item => {
                const itemPath = item.path.split('?')[0];
                const itemQuery = item.path.includes('?') ? item.path.split('?')[1] : null;
                const isActive = itemQuery
                  ? location.pathname === itemPath && location.search.includes(itemQuery)
                  : location.pathname === itemPath && !location.search;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all group ${isActive ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
                  >
                    <svg className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span className={`text-sm font-bold transition-opacity duration-300 whitespace-nowrap ${expanded ? 'opacity-100' : 'opacity-0'}`}>{item.title}</span>
                  </Link>
                );
              })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50 overflow-hidden">
          {/* User */}
          <div className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-2xl mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-black shadow-lg shadow-red-900/20 flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className={`flex-1 min-w-0 transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter capitalize">{userRole}</p>
            </div>
          </div>

          {/* Bell button */}
          {!isAdmin && (
            <button
              onClick={() => setNotifOpen(o => !o)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all mb-1 ${notifOpen ? 'bg-slate-700/60 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
            >
              <div className="relative flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-[9px] font-black text-white flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-sm font-bold transition-opacity duration-300 whitespace-nowrap ${expanded ? 'opacity-100' : 'opacity-0'}`}>
                Notificaciones
              </span>
            </button>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm disabled:opacity-50 whitespace-nowrap overflow-hidden"
          >
            {isLoggingOut
              ? <div className="w-6 h-6 border-2 border-slate-400 border-t-red-400 rounded-full animate-spin flex-shrink-0" />
              : <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            }
            <span className={`transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
              {isLoggingOut ? 'Saliendo...' : 'Cerrar Sesión'}
            </span>
          </button>
        </div>
      </aside>

      {notifPanel}
    </>
  );
}
