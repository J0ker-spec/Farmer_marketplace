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
import { withMessageIds } from '../utils/documents';

export interface Message {
  message_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  product_id?: string;
  order_id?: string;
  sender_name?: string;
  recipient_name?: string;
}

export function useMessages(userId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to fetch a user's name from Firestore
  const getUserName = async (uid: string): Promise<string> => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      return snap.exists() ? snap.data()?.name || 'Unknown' : 'Unknown';
    } catch {
      return 'Unknown';
    }
  };

  const buildConversations = (formattedMessages: Message[]) => {
    const convMap = new Map<string, any>();
    formattedMessages.forEach((msg: Message) => {
      const otherId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
      const otherName = msg.sender_id === userId ? msg.recipient_name : msg.sender_name;
      const key = [userId, otherId].sort().join('_');

      if (!convMap.has(key)) {
        convMap.set(key, {
          otherId,
          otherName,
          lastMessage: msg.content,
          lastMessageTime: msg.created_at,
          unreadCount: msg.is_read ? 0 : msg.recipient_id === userId ? 1 : 0,
        });
      } else {
        const conv = convMap.get(key);
        if (msg.is_read === false && msg.recipient_id === userId) {
          conv.unreadCount++;
        }
      }
    });
    setConversations(Array.from(convMap.values()));
  };

  const sendMessage = async (
    recipientId: string,
    content: string,
    productId?: string,
    orderId?: string
  ) => {
    if (!userId) return;

    try {
      await addDoc(collection(db, 'messages'), {
        sender_id: userId,
        recipient_id: recipientId,
        content,
        product_id: productId || null,
        order_id: orderId || null,
        is_read: false,
        created_at: new Date().toISOString(),
      });
      // No manual refetch needed — onSnapshot fires automatically
    } catch (err: any) {
      console.error('Failed to send message:', err);
      throw err;
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), { is_read: true });
      // No manual refetch needed — onSnapshot fires automatically
    } catch (err: any) {
      console.error('Failed to mark message as read:', err);
    }
  };

  const getConversationMessages = (otherId: string) => {
    return messages.filter(
      (msg) =>
        (msg.sender_id === userId && msg.recipient_id === otherId) ||
        (msg.sender_id === otherId && msg.recipient_id === userId)
    );
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Firestore doesn't support OR across two fields in one query,
    // so we run two queries and merge the results
    const sentQuery = query(
      collection(db, 'messages'),
      where('sender_id', '==', userId),
      orderBy('created_at', 'desc')
    );

    const receivedQuery = query(
      collection(db, 'messages'),
      where('recipient_id', '==', userId),
      orderBy('created_at', 'desc')
    );

    let sentMessages: any[] = [];
    let receivedMessages: any[] = [];
    let sentLoaded = false;
    let receivedLoaded = false;

    const merge = async (sent: any[], received: any[]) => {
      // Deduplicate and sort
      const allMap = new Map<string, any>();
      [...sent, ...received].forEach((m) => allMap.set(m.message_id, m));
      const all = Array.from(allMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Enrich with sender/recipient names
      const enriched = await Promise.all(
        all.map(async (msg) => ({
          ...msg,
          sender_name: await getUserName(msg.sender_id),
          recipient_name: await getUserName(msg.recipient_id),
        }))
      );

      setMessages(enriched);
      buildConversations(enriched);
      setError(null);
      setLoading(false);
    };

    const unsubSent = onSnapshot(
      sentQuery,
      (snap) => {
        sentMessages = snap.docs.map((d) => withMessageIds(d.id, d.data() as Record<string, unknown>));
        sentLoaded = true;
        if (sentLoaded && receivedLoaded) merge(sentMessages, receivedMessages);
      },
      (err) => {
        console.error('Sent messages snapshot error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    const unsubReceived = onSnapshot(
      receivedQuery,
      (snap) => {
        receivedMessages = snap.docs.map((d) => withMessageIds(d.id, d.data() as Record<string, unknown>));
        receivedLoaded = true;
        if (sentLoaded && receivedLoaded) merge(sentMessages, receivedMessages);
      },
      (err) => {
        console.error('Received messages snapshot error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubSent();
      unsubReceived();
    };
  }, [userId]);

  return {
    messages,
    conversations,
    loading,
    error,
    sendMessage,
    markAsRead,
    getConversationMessages,
    refetch: () => { }, // onSnapshot keeps data live — refetch is a no-op
  };
}