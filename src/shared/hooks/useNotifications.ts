import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/httpClient';

export interface Notification {
  id: string;
  type: string | null;
  title: string | null;
  body: string | null;
  read: boolean;
  created_at: string | null;
}

const POLL_INTERVAL = 30_000;

const getRole = () => localStorage.getItem('userRole') || 'student';

const sessionDeletedIds = new Set<string>();

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const role = getRole();
      const url = role === 'student' ? '/student/notifications' : '/tutor/notifications';
      const res = await apiClient.get(url);
      if (res.data?.success) {
        // Filter out notifications we just deleted locally but haven't synced yet
        const raw = res.data.data ?? [];
        setNotifications(raw.filter((n: Notification) => !sessionDeletedIds.has(n.id)));
      }
    } catch (e) {
      console.error('[useNotifications] fetch error:', e);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  const deleteNotif = async (notifId: string) => {
    if (!notifId) return;
    
    // Optimistic UI update
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    sessionDeletedIds.add(notifId);

    try {
      const role = getRole();
      const url = role === 'student'
        ? `/student/notifications/${notifId}`
        : `/tutor/notifications/${notifId}`;
      
      await apiClient.delete(url);
      await fetchNotifications();
    } catch (e) {
      console.error('[deleteNotif] error:', e);
    }
  };

  const markRead = async (notifId: string) => {
    if (!notifId) return;
    
    // Optimistic UI update
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    sessionDeletedIds.add(notifId);

    try {
      const role = getRole();
      const url = role === 'student'
        ? `/student/notifications/${notifId}/read`
        : `/tutor/notifications/${notifId}/read`;
      
      await apiClient.patch(url);
      await fetchNotifications();
    } catch (e) {
      console.error('[markRead] error:', e);
    }
  };

  const markAllRead = async () => {
    if (notifications.length === 0) return;

    // Track all current notification IDs
    const ids = notifications.map(n => n.id);
    ids.forEach(id => sessionDeletedIds.add(id));
    
    // Optimistic UI update
    setNotifications([]);

    try {
      const role = getRole();
      const url = role === 'student'
        ? '/student/notifications/read_all'
        : '/tutor/notifications/read_all';
      
      await apiClient.patch(url);
      await fetchNotifications();
    } catch (e) {
      console.error('[markAllRead] error:', e);
    }
  };

  const unreadCount = notifications.length; // Use all shown notifications as they are filtered as unread for now

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
