import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export interface Notification {
  id: string;
  type: string | null;
  title: string | null;
  body: string | null;
  read: boolean;
  created_at: string | null;
}

const POLL_INTERVAL = 15_000;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const userRole = localStorage.getItem('userRole') || 'student';
  const isStudent = userRole === 'student';
  const isTutor   = userRole === 'tutor';

  const fetchNotifications = useCallback(async () => {
    if (!isStudent && !isTutor) return;
    try {
      const res = isTutor
        ? await api.getTutorNotifications()
        : await api.getStudentNotifications();
      if (res?.success) setNotifications(res.data ?? []);
    } catch { /* silencioso */ }
  }, [isStudent, isTutor]);

  useEffect(() => {
    if (!localStorage.getItem('authToken')) return;
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      if (isTutor) await api.markTutorNotificationRead(id);
      else         await api.markStudentNotificationRead(id);
    } catch { /* silencioso */ }
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      if (isTutor) await api.markAllTutorNotificationsRead();
      else         await api.markAllStudentNotificationsRead();
    } catch { /* silencioso */ }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, isOpen, setIsOpen, markRead, markAllRead, fetchNotifications };
}
