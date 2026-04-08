import { useRef } from 'react';
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


interface Props {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  onToggle: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  offset: number;
}

export default function NotificationPanel({
  notifications, unreadCount, isOpen, onToggle, onMarkRead, onMarkAllRead, onDelete, offset
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  const panel = (
    <div 
      className="fixed inset-0 z-[100] flex justify-start"
      style={{ pointerEvents: 'none' }}
    >
      {/* Backdrop — only for area RIGHT of the panel if needed, but let's keep it simple */}
      <div 
        className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] transition-opacity duration-300" 
        style={{ pointerEvents: 'auto' }}
        onClick={onToggle}
      />
      
      {/* Panel */}
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        style={{ 
          marginLeft: offset, 
          pointerEvents: 'auto',
          boxShadow: '20px 0 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        className="relative w-full max-w-[300px] h-full bg-slate-900 border-r border-slate-800 flex flex-col animate-in slide-in-from-left duration-300"
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-white uppercase tracking-widest">Notificaciones</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-full shadow-lg shadow-red-900/20">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <button 
                onClick={onMarkAllRead} 
                className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                title="Marcar todas como leídas"
              >
                Leer todas
              </button>
            )}
            <button onClick={onToggle} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none pb-10">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 opacity-40">
              <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Tu bandeja está vacía</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/40">
              {notifications.map(n => (
                <div 
                  key={n.id}
                  className={`relative group flex items-start gap-4 px-4 py-5 transition-all hover:bg-slate-800/30 ${!n.read ? 'bg-red-500/[0.02]' : ''}`}
                >
                  <button 
                    onClick={() => onMarkRead(n.id)}
                    className="flex-1 text-left flex items-start gap-4"
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg shadow-inner ${!n.read ? 'bg-slate-800 group-hover:bg-slate-700' : 'bg-slate-900/50'}`}>
                      {TYPE_ICON[n.type ?? ''] ?? '🔔'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`text-[12px] font-bold tracking-tight leading-tight transition-colors ${n.read ? 'text-slate-500' : 'text-white'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-600 font-medium whitespace-nowrap">{timeAgo(n.created_at)}</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed transition-colors ${n.read ? 'text-slate-600' : 'text-slate-400'}`}>
                        {n.body}
                      </p>
                    </div>
                  </button>

                  <div className="flex flex-col items-center gap-3 mt-1">
                    {!n.read && <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)] flex-shrink-0" />}
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
                      className="p-2 hover:bg-red-500/10 rounded-xl transition-all text-slate-600 hover:text-red-500"
                      title="Eliminar notificación"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return isOpen ? createPortal(panel, document.body) : null;
}
