import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Notification } from '../hooks/useNotifications';

const TYPE_ICON: Record<string, string> = {
  tutoring_requested:   '🚀',
  tutoring_confirmed:   '✅',
  tutoring_rescheduled: '🔄',
  tutoring_graded:      '📋',
  grade:                '📋',
  badge_earned:         '🏅',
  deadline:             '⏰',
  block_approved:       '🎯',
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const PANEL_HEIGHT = 320;
const PANEL_WIDTH  = 296;

interface Props {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  onToggle: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  collapsed: boolean;
}

export default function NotificationPanel({
  notifications, unreadCount, isOpen, onToggle, onMarkRead, onMarkAllRead, collapsed
}: Props) {
  const btnRef  = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const left = rect.right + 12;

    // Centrar verticalmente respecto al botón, ajustar si se sale de pantalla
    let top = rect.top + rect.height / 2 - PANEL_HEIGHT / 2;
    const maxTop = window.innerHeight - PANEL_HEIGHT - 12;
    top = Math.max(12, Math.min(top, maxTop));

    setPos({ top, left });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(t) &&
        btnRef.current  && !btnRef.current.contains(t)
      ) onToggle();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onToggle]);

  const dropdown = isOpen ? (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: PANEL_WIDTH,
        zIndex: 9999,
      }}
      className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Notificaciones
          </span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 bg-red-600/20 text-red-400 text-[9px] font-black rounded-full border border-red-600/20">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-[9px] font-black text-slate-600 hover:text-slate-300 uppercase tracking-widest transition-colors"
          >
            Leer todas
          </button>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto" style={{ maxHeight: PANEL_HEIGHT - 44 }}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <svg className="w-8 h-8 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-[10px] text-slate-700 uppercase tracking-widest font-black">Sin notificaciones</p>
          </div>
        ) : (
          notifications.map(n => (
            <button
              key={n.id}
              onClick={() => !n.read && onMarkRead(n.id)}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-slate-800/50 last:border-0 transition-colors hover:bg-slate-800/30 ${!n.read ? 'bg-slate-800/20' : ''}`}
            >
              {/* Icon */}
              <span className="text-base flex-shrink-0 leading-none mt-0.5">
                {TYPE_ICON[n.type ?? ''] ?? '🔔'}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <p className={`text-[11px] font-black uppercase tracking-tight leading-tight truncate ${n.read ? 'text-slate-500' : 'text-white'}`}>
                    {n.title}
                  </p>
                  <span className="text-[9px] text-slate-700 flex-shrink-0 font-medium">
                    {timeAgo(n.created_at)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                  {n.body}
                </p>
              </div>

              {/* Unread dot */}
              {!n.read && (
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={onToggle}
        className="relative flex items-center gap-4 px-3 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all w-full"
        title="Notificaciones"
      >
        <div className="relative flex-shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-[9px] font-black text-white flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <span className={`text-sm font-bold whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
          Notificaciones
        </span>
      </button>

      {createPortal(dropdown, document.body)}
    </>
  );
}
