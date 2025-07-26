import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '@/types/notification';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  getUnreadNotificationsCount 
} from '@/services/NotificationService';
import { supabase } from '@/lib/supabase';

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotif: (id: string) => void;
  refreshNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export const NotificationsProvider: React.FC<{
  children: React.ReactNode;
  userId: string;
}> = ({ children, userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // جلب الإشعارات من Supabase
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications(userId);
      setNotifications(data || []);
      
      const count = await getUnreadNotificationsCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // إعداد Real-time subscription
  useEffect(() => {
  if (!userId || userId.trim() === "") {
    console.warn("NotificationsProvider: userId is invalid, skipping fetch and subscription.");
    return;
  }

  fetchNotifications();

  const subscription = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `to_user_id=eq.${userId}`,
      },
      (payload) => {
        const newNotification = payload.new as Notification;
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `to_user_id=eq.${userId}`,
      },
      (payload) => {
        const updatedNotification = payload.new as Notification;
        setNotifications(prev => 
          prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
        );
        getUnreadNotificationsCount(userId).then(setUnreadCount);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'notifications',
        filter: `to_user_id=eq.${userId}`,
      },
      (payload) => {
        const deletedId = payload.old.id;
        setNotifications(prev => prev.filter(n => n.id !== deletedId));
        getUnreadNotificationsCount(userId).then(setUnreadCount);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [userId]);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.is_read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotif = async (id: string) => {
    try {
      await deleteNotification(id);
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const refreshNotifications = () => {
    fetchNotifications();
  };

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotif,
      refreshNotifications
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};