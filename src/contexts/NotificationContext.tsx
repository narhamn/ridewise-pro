import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Notification, UserRole } from '@/types/shuttle';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: (role: UserRole) => number;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (role: UserRole) => void;
  deleteNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const initialNotifications: Notification[] = [
  { id: 'n1', title: 'Booking Dikonfirmasi', message: 'Booking Hermes → Kualanamu kursi #1 telah dikonfirmasi', type: 'booking', read: false, timestamp: '2026-04-02T07:00:00', role: 'customer' },
  { id: 'n2', title: 'Pembayaran Berhasil', message: 'Pembayaran Rp76.000 via Transfer Bank berhasil', type: 'payment', read: false, timestamp: '2026-04-02T07:01:00', role: 'customer' },
  { id: 'n3', title: 'Trip Baru', message: 'Anda ditugaskan untuk rute Hermes → Kualanamu jam 07:00', type: 'trip', read: false, timestamp: '2026-04-02T06:30:00', role: 'driver' },
  { id: 'n4', title: 'Booking Baru', message: '3 booking baru untuk jadwal hari ini', type: 'booking', read: false, timestamp: '2026-04-02T06:00:00', role: 'admin' },
  { id: 'n5', title: 'Perjalanan Dimulai', message: 'Pinang Baris → Sibolga telah berangkat', type: 'trip', read: true, timestamp: '2026-04-02T06:05:00', role: 'admin' },
];

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = useCallback((role: UserRole) => {
    return notifications.filter(n => n.role === role && !n.read).length;
  }, [notifications]);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications(prev => [{
      ...n,
      id: `n${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    }, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback((role: UserRole) => {
    setNotifications(prev => prev.map(n => n.role === role ? { ...n, read: true } : n));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, deleteNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
