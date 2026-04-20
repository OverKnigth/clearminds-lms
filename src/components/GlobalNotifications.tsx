import { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../hooks/useNotifications';

export default function GlobalNotifications() {
  const { notifications = [] } = useNotifications();
  const [toast, setToast] = useState<{ id: string; title: string; body: string } | null>(null);
  const lastToastId = useRef<string | null>(null);

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;
    
    const unread = notifications.filter(n => n && !n.read);
    if (unread.length === 0) return;

    // Obtener la notificación más reciente (asumiendo que están ordenadas o tomamos la primera de la lista de unread)
    const latest = unread[0];

    // Verificar si es una notificación de calificación y si ya la mostramos
    if (latest && 
        latest.id !== lastToastId.current && 
        (latest.type === 'grade' || latest.type === 'tutoring_graded')) {
      
      lastToastId.current = latest.id;
      
      setToast({
        id: latest.id,
        title: 'Sistema',
        body: `${latest.body || 'Un tutor ha calificado tu reto'}. Recargue la página por favor.`
      });

      // Auto-ocultar después de 8 segundos
      const timer = setTimeout(() => setToast(null), 8000);
      return () => clearTimeout(timer);
    }
    
    // Si no es de calificación pero es nueva, actualizamos el ref para no procesarla de nuevo
    if (latest && latest.id !== lastToastId.current) {
      lastToastId.current = latest.id;
    }
  }, [notifications]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-right-8 duration-500">
      <div className="group relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl shadow-2xl shadow-black/80 max-w-sm overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-colors" />
        
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-500/20">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-black text-white uppercase tracking-widest">{toast.title}</h4>
              <button onClick={() => setToast(null)} className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-sm text-slate-300 font-medium leading-relaxed leading-snug pr-2">
              {toast.body}
            </p>
            
            <div className="mt-4 flex gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-blue-900/40"
              >
                Recargar Página
              </button>
              <button 
                onClick={() => setToast(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar at bottom */}
        <div className="absolute bottom-0 left-0 h-1 bg-blue-600/50 animate-toast-progress" style={{ width: '100%', animation: 'progress 8s linear forwards' }} />
      </div>

      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
