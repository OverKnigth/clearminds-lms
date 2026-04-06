import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';

export interface Notification {
  id: string;
  type: string | null;
  title: string | null;
  body: string | null;
  read: boolean;
  created_at: string | null;
}

const POLL_INTERVAL = 30_000; // Increased to 30s to avoid race conditions during updates

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Memoize roles as they are used in hook dependencies
  const userRole = localStorage.getItem('userRole') || 'student';
  const roleInfo = useMemo(() => ({
    isStudent: userRole === 'student',
    isTutor: userRole === 'tutor' || userRole === 'admin',
    isAdmin: userRole === 'admin'
  }), [userRole]);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    try {
      const res = roleInfo.isTutor
        ? await api.getTutorNotifications()
        : (roleInfo.isStudent ? await api.getStudentNotifications() : null);
      
      if (res?.success) {
        // Solo mostrar notificaciones no leídas
        setNotifications((res.data ?? []).filter((n: Notification) => !n.read));
      }
    } catch (error) {
      console.error('[useNotifications] Poll error:', error);
    }
  }, [roleInfo.isStudent, roleInfo.isTutor]);

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    if (!id) return;
    // Optimistic: marcar como leída localmente
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      if (roleInfo.isTutor) await api.markTutorNotificationRead(id);
      else if (roleInfo.isStudent) await api.markStudentNotificationRead(id);
    } catch (error) {
      console.error('[useNotifications] MarkRead error:', error);
      // En caso de error, recargar
      fetchNotifications();
    }
  };

  const deleteNotif = async (id: string) => {
    if (!id) return;
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      if (roleInfo.isTutor) await api.markTutorNotificationRead(id);
      else if (roleInfo.isStudent) await api.markStudentNotificationRead(id);
    } catch (error) {
      console.error('[useNotifications] Delete error:', error);
      fetchNotifications();
    }
  };

  const markAllRead = async () => {
    setNotifications([]);
    try {
      if (roleInfo.isTutor) await api.markAllTutorNotificationsRead();
      else if (roleInfo.isStudent) await api.markAllStudentNotificationsRead();
    } catch (error) {
      console.error('[useNotifications] MarkAllRead error:', error);
      fetchNotifications();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return { 
    notifications, 
    unreadCount, 
    isOpen, 
    setIsOpen, 
    markRead, 
    markAllRead, 
    deleteNotif, 
    fetchNotifications 
  };
}
