
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../services/firebase';

export interface Notification {
  notification_id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: any;
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { read: true });
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      for (const notification of unreadNotifications) {
        await updateDoc(doc(db, 'notifications', notification.notification_id), { read: true });
      }
    } catch (err: any) {
      console.error('Failed to mark all as read:', err);
    }
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const formattedNotifications = snap.docs.map((d) => ({
          notification_id: d.id,
          ...d.data(),
        })) as Notification[];
        setNotifications(formattedNotifications);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Notifications snapshot error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsub;
  }, [userId]);

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  };
}
